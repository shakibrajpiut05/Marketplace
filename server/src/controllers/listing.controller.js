import SellerListing from "../models/SellerListing.js";
import Document from "../models/Document.js";

export const createListing = async (req, res) => {
  try {
    const {
      category,
      quantity,
      price,
      location,
      complianceYear,
      validTill,
      description,
    } = req.body || {};

    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create listings",
      });
    }

    if (req.user.kycStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your KYC must be approved before creating a listing",
      });
    }

    if (
      !category ||
      !quantity ||
      !price ||
      !location ||
      !complianceYear ||
      !validTill
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, quantity, price, location, compliance year and valid till are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof document is required",
      });
    }

    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(price);
    const parsedValidTill = new Date(validTill);

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a valid positive number",
      });
    }

    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid positive number",
      });
    }

    if (Number.isNaN(parsedValidTill.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid till must be a valid date",
      });
    }

    const document = await Document.create({
      owner: req.user._id,
      type: "epr_certificate",
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      verificationStatus: "pending",
    });

    const listing = await SellerListing.create({
      sellerId: req.user._id,
      category,
      quantity: parsedQuantity,
      price: parsedPrice,
      location,
      complianceYear,
      validTill: parsedValidTill,
      description: description || "",
      documentId: document._id,
      status: "pending_review",
    });

    return res.status(201).json({
      success: true,
      message:
        "Listing submitted successfully for verification",
      listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create listing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get pending seller listings
|--------------------------------------------------------------------------
*/

export const getPendingListings = async (
  req,
  res
) => {
  try {
    const listings = await SellerListing.find({
      status: "pending_review",
    })
      .populate(
        "sellerId",
        "name company email phone role kycStatus verifiedBadge"
      )
      .populate(
        "documentId",
        "fileName fileUrl mimeType fileSize verificationStatus createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error(
      "Get pending listings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch pending listings",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Approve / reject seller listing
|--------------------------------------------------------------------------
*/

export const reviewListing = async (
  req,
  res
) => {
  try {
    const { listingId } = req.params;
    const {
      status,
      rejectionReason,
    } = req.body;

    if (!["active", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be active or rejected",
      });
    }

    if (
      status === "rejected" &&
      !rejectionReason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required",
      });
    }

    const listing =
      await SellerListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.status !== "pending_review") {
      return res.status(400).json({
        success: false,
        message:
          "This listing has already been reviewed",
      });
    }

    listing.status = status;

    listing.rejectionReason =
      status === "rejected"
        ? rejectionReason.trim()
        : "";

    listing.approvedBy = req.user._id;
    listing.approvedAt = new Date();

    await listing.save();

    /*
    |--------------------------------------------------------------------------
    | Update proof document
    |--------------------------------------------------------------------------
    */

    const document =
      await Document.findById(
        listing.documentId
      );

    if (document) {
      document.verificationStatus =
        status === "active"
          ? "approved"
          : "rejected";

      document.rejectionReason =
        status === "rejected"
          ? rejectionReason.trim()
          : "";

      document.verifiedBy =
        req.user._id;

      document.verifiedAt =
        new Date();

      await document.save();
    }

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Listing approved successfully"
          : "Listing rejected successfully",
      listing,
    });
  } catch (error) {
    console.error(
      "Review listing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to review listing",
    });
  }
};

//get active listing

export const getActiveListings = async (req, res) => {
  try {
    const {
      category,
      location,
      complianceYear,
      sort = "newest",
    } = req.query;

    const filter = {
      status: "active",
      validTill: {
        $gte: new Date(),
      },
    };

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    if (complianceYear) {
      filter.complianceYear = complianceYear;
    }

    let query = SellerListing.find(filter)
      .populate(
        "sellerId",
        "name company verifiedBadge"
      )
      .populate(
        "documentId",
        "fileName fileUrl verificationStatus"
      );

    switch (sort) {
      case "price-asc":
        query = query.sort({ price: 1 });
        break;

      case "price-desc":
        query = query.sort({ price: -1 });
        break;

      case "qty-desc":
        query = query.sort({ quantity: -1 });
        break;

      case "newest":
      default:
        query = query.sort({ createdAt: -1 });
        break;
    }

    const listings = await query;

    return res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error(
      "Get active listings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace listings",
    });
  }
};

export const getListingById = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await SellerListing.findOne({
      _id: listingId,
      status: "active",
      validTill: {
        $gte: new Date(),
      },
    })
      .populate(
        "sellerId",
        "name company verifiedBadge"
      )
      .populate(
        "documentId",
        "fileName fileUrl mimeType verificationStatus"
      );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error(
      "Get listing by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch listing",
    });
  }
};

export const getSellerListings = async (req, res) => {
  try {
    const listings = await SellerListing.find({
      sellerId: req.user._id,
    })
      .populate(
        "documentId",
        "fileName fileUrl verificationStatus rejectionReason"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error(
      "Get seller listings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller listings",
    });
  }
};