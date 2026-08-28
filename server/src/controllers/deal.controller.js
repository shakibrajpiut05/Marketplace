import mongoose from "mongoose";
import Deal from "../models/Deal.js";
import BuyerRequirement from "../models/BuyerRequirement.js";
import SellerListing from "../models/SellerListing.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import { notifyDealStatusChange } from "../services/notification.service.js";
import { createActivityLog } from "../services/activityLog.service.js";

/*

CREATE MULTIPLE DEALS FROM A FULLY MATCHED REQUIREMENT

--------------------------------------------------------------------------



One BuyerRequirement can contain multiple matched seller listings.



Example:



Requirement = 200 MT



Seller A = 100 MT

Seller B = 100 MT



This creates:



Deal A = 100 MT

Deal B = 100 MT



Inventory is RESERVED when the deals are created.

--------------------------------------------------------------------------

*/

export const createDealsFromRequirement = async (req, res) => {
try {
const { requirementId, commissionRate = 2 } = req.body || {};

/*
|--------------------------------------------------------------------------
| Validate requirement ID
|--------------------------------------------------------------------------
*/

if (!requirementId || !mongoose.Types.ObjectId.isValid(requirementId)) {
  return res.status(400).json({
    success: false,
    message: "A valid requirementId is required",
  });
}

/*
|--------------------------------------------------------------------------
| Find requirement
|--------------------------------------------------------------------------
*/

const requirement = await BuyerRequirement.findById(requirementId).lean();

if (!requirement) {
  return res.status(404).json({
    success: false,
    message: "Requirement not found",
  });
}

/*
|--------------------------------------------------------------------------
| Only fully matched requirements can create deals
|--------------------------------------------------------------------------
*/

if (requirement.status !== "fully_matched") {
  return res.status(400).json({
    success: false,
    message: "Only fully matched requirements can create seller deals",
  });
}

/*
|--------------------------------------------------------------------------
| Validate matched listings
|--------------------------------------------------------------------------
*/

if (
  !Array.isArray(requirement.matchedListings) ||
  requirement.matchedListings.length === 0
) {
  return res.status(400).json({
    success: false,
    message: "No matched seller listings found",
  });
}

/*
|--------------------------------------------------------------------------
| Validate commission rate
|--------------------------------------------------------------------------
*/

const rate = Number(commissionRate);

if (!Number.isFinite(rate) || rate < 0) {
  return res.status(400).json({
    success: false,
    message: "Commission rate must be a valid non-negative number",
  });
}

const createdDeals = [];
const existingDeals = [];

/*
|--------------------------------------------------------------------------
| Create one deal per matched seller
|--------------------------------------------------------------------------
*/

for (const match of requirement.matchedListings) {
  const matchedQuantity = Number(match.quantity);

  if (!Number.isFinite(matchedQuantity) || matchedQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Matched quantity must be greater than zero",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Prevent duplicate deals
  |--------------------------------------------------------------------------
  */

  const existingDeal = await Deal.findOne({
    requirementId: requirement._id,

    matchedListingId: match.listingId,
  });

  if (existingDeal) {
    existingDeals.push(existingDeal);

    continue;
  }

  /*
  |--------------------------------------------------------------------------
  | Atomically reserve seller inventory
  |--------------------------------------------------------------------------
  |
  | Available quantity =
  |
  | quantity - reservedQuantity
  |
  | The condition and increment happen together,
  | which prevents two concurrent deal creations
  | from reserving the same inventory.
  |--------------------------------------------------------------------------
  */

  const listing = await SellerListing.findOneAndUpdate(
    {
      _id: match.listingId,

      status: "active",

      validTill: {
        $gte: new Date(),
      },

      $expr: {
        $gte: [
          {
            $subtract: [
              "$quantity",
              {
                $ifNull: ["$reservedQuantity", 0],
              },
            ],
          },
          matchedQuantity,
        ],
      },
    },
    {
      $inc: {
        reservedQuantity: matchedQuantity,
      },
    },
    {
      new: true,
    },
  );

  if (!listing) {
    return res.status(409).json({
      success: false,
      message: `Insufficient available quantity for matched listing ${match.listingId}`,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Validate price
  |--------------------------------------------------------------------------
  */

  const agreedPrice = Number(listing.price);

  if (!Number.isFinite(agreedPrice) || agreedPrice <= 0) {
    /*
    |--------------------------------------------------------------------------
    | Roll back reservation because
    | listing price is invalid.
    |--------------------------------------------------------------------------
    */

    await SellerListing.updateOne(
      {
        _id: listing._id,
      },
      {
        $inc: {
          reservedQuantity: -matchedQuantity,
        },
      },
    );

    return res.status(400).json({
      success: false,
      message: "Matched listing has an invalid price",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Calculate deal value
  |--------------------------------------------------------------------------
  */

  const totalValue = matchedQuantity * agreedPrice;

  /*
  |--------------------------------------------------------------------------
  | Calculate commission
  |--------------------------------------------------------------------------
  */

  const commissionAmount = (totalValue * rate) / 100;

  /*
  |--------------------------------------------------------------------------
  | Create deal
  |--------------------------------------------------------------------------
  */

  try {
    const deal = await Deal.create({
      requestId: null,

      requirementId: requirement._id,

      matchedListingId: listing._id,

      listingId: listing._id,

      buyerId: requirement.buyerId,

      sellerId: listing.sellerId,

      quantity: matchedQuantity,

      agreedPrice,

      commissionRate: rate,

      commissionAmount,

      /*
        |--------------------------------------------------------------------------
        | Inventory is now reserved
        |--------------------------------------------------------------------------
        */

      inventoryReserved: true,

      status: "matched",

      paymentStatus: "pending",

      notes: "Created from fully matched buyer requirement by EPR Nexus.",
    });

    createdDeals.push(deal);
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | If deal creation fails after inventory
    | reservation, release the reservation.
    |--------------------------------------------------------------------------
    */

    await SellerListing.updateOne(
      {
        _id: listing._id,
      },
      {
        $inc: {
          reservedQuantity: -matchedQuantity,
        },
      },
    );

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Success response
|--------------------------------------------------------------------------
*/

return res.status(201).json({
  success: true,

  message:
    createdDeals.length > 0
      ? "Deals created successfully from matched requirement"
      : "Deals already exist for all matched listings",

  createdCount: createdDeals.length,

  existingCount: existingDeals.length,

  deals: [...existingDeals, ...createdDeals],

  requirement: {
    _id: requirement._id,

    quantity: requirement.quantity,

    matchedQuantity: requirement.matchedQuantity,

    remainingQuantity: requirement.remainingQuantity,

    status: requirement.status,
  },
});

} catch (error) {
console.error("Create deals from requirement error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to create deals from requirement",
});

}
};

/*

CREATE DEAL FROM PURCHASE REQUEST

--------------------------------------------------------------------------



Legacy / existing PurchaseRequest-based deal flow.



Inventory is also RESERVED here.

--------------------------------------------------------------------------

*/

export const createDeal = async (req, res) => {
try {
const {
requestId,
agreedPrice,
commissionRate = 2,
notes = "",
} = req.body || {};

/*
|--------------------------------------------------------------------------
| Validate request ID
|--------------------------------------------------------------------------
*/

if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
  return res.status(400).json({
    success: false,
    message: "A valid requestId is required",
  });
}

/*
|--------------------------------------------------------------------------
| Load purchase request
|--------------------------------------------------------------------------
*/

const request = await PurchaseRequest.findById(requestId)
  .populate("buyerId", "name company email")
  .populate(
    "listingId",
    "sellerId category quantity price location validTill",
  );

if (!request) {
  return res.status(404).json({
    success: false,
    message: "Purchase request not found",
  });
}

/*
|--------------------------------------------------------------------------
| Request must be matched
|--------------------------------------------------------------------------
*/

if (request.status !== "matched") {
  return res.status(400).json({
    success: false,
    message: "Only matched purchase requests can be converted into a deal",
  });
}

/*
|--------------------------------------------------------------------------
| Prevent duplicate deal
|--------------------------------------------------------------------------
*/

const existingDeal = await Deal.findOne({
  requestId,
});

if (existingDeal) {
  return res.status(409).json({
    success: false,
    message: "A deal already exists for this purchase request",
    deal: existingDeal,
  });
}

const listing = request.listingId;

if (!listing) {
  return res.status(404).json({
    success: false,
    message: "Listing associated with request not found",
  });
}

/*
|--------------------------------------------------------------------------
| Validate buyer / seller
|--------------------------------------------------------------------------
*/

if (!listing.sellerId || !request.buyerId) {
  return res.status(400).json({
    success: false,
    message: "Buyer or seller information is missing",
  });
}

/*
|--------------------------------------------------------------------------
| Requested quantity
|--------------------------------------------------------------------------
*/

const requestedQuantity = Number(request.quantity);

if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
  return res.status(400).json({
    success: false,
    message: "Requested quantity must be a valid positive number",
  });
}

/*
|--------------------------------------------------------------------------
| Atomically reserve inventory
|--------------------------------------------------------------------------
*/

const reservedListing = await SellerListing.findOneAndUpdate(
  {
    _id: listing._id,

    status: "active",

    validTill: {
      $gte: new Date(),
    },

    $expr: {
      $gte: [
        {
          $subtract: [
            "$quantity",
            {
              $ifNull: ["$reservedQuantity", 0],
            },
          ],
        },
        requestedQuantity,
      ],
    },
  },
  {
    $inc: {
      reservedQuantity: requestedQuantity,
    },
  },
  {
    new: true,
  },
);

if (!reservedListing) {
  return res.status(409).json({
    success: false,
    message: "Insufficient available listing quantity",
  });
}

/*
|--------------------------------------------------------------------------
| Validate price
|--------------------------------------------------------------------------
*/

const price = Number(agreedPrice ?? reservedListing.price);

const rate = Number(commissionRate);

if (!Number.isFinite(price) || price <= 0) {
  /*
  |--------------------------------------------------------------------------
  | Release reservation on validation failure
  |--------------------------------------------------------------------------
  */

  await SellerListing.updateOne(
    {
      _id: reservedListing._id,
    },
    {
      $inc: {
        reservedQuantity: -requestedQuantity,
      },
    },
  );

  return res.status(400).json({
    success: false,
    message: "Agreed price must be a valid positive number",
  });
}

if (!Number.isFinite(rate) || rate < 0) {
  /*
  |--------------------------------------------------------------------------
  | Release reservation on validation failure
  |--------------------------------------------------------------------------
  */

  await SellerListing.updateOne(
    {
      _id: reservedListing._id,
    },
    {
      $inc: {
        reservedQuantity: -requestedQuantity,
      },
    },
  );

  return res.status(400).json({
    success: false,
    message: "Commission rate must be a valid non-negative number",
  });
}

/*
|--------------------------------------------------------------------------
| Calculate deal value
|--------------------------------------------------------------------------
*/

const totalValue = requestedQuantity * price;

const commissionAmount = (totalValue * rate) / 100;

/*
|--------------------------------------------------------------------------
| Create deal
|--------------------------------------------------------------------------
*/

try {
  const deal = await Deal.create({
    requestId: request._id,

    listingId: reservedListing._id,

    buyerId: request.buyerId._id,

    sellerId: reservedListing.sellerId,

    quantity: requestedQuantity,

    agreedPrice: price,

    commissionRate: rate,

    commissionAmount,

    inventoryReserved: true,

    status: "matched",

    paymentStatus: "pending",

    notes: notes.trim(),
  });

  return res.status(201).json({
    success: true,
    message: "Deal created successfully",
    deal,
  });
} catch (error) {
  /*
  |--------------------------------------------------------------------------
  | Release reservation if deal creation fails
  |--------------------------------------------------------------------------
  */

  await SellerListing.updateOne(
    {
      _id: reservedListing._id,
    },
    {
      $inc: {
        reservedQuantity: -requestedQuantity,
      },
    },
  );

  throw error;
}

} catch (error) {
console.error("Create deal error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to create deal",
});

}
};

/*

GET ADMIN DEALS

--------------------------------------------------------------------------

*/

export const getAdminDeals = async (req, res) => {
try {
const deals = await Deal.find()
.populate("buyerId", "name company email")
.populate("sellerId", "name company email")
.populate(
"listingId",
"category quantity totalQuantity price location complianceYear validTill reservedQuantity",
)
.populate("requestId", "quantity status notes createdAt")
.populate(
"requirementId",
"quantity matchedQuantity remainingQuantity status",
)
.sort({
createdAt: -1,
});

return res.status(200).json({
  success: true,
  count: deals.length,
  deals,
});

} catch (error) {
console.error("Get admin deals error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to fetch deals",
});

}
};

/*

UPDATE DEAL STATUS

--------------------------------------------------------------------------



Active deal:



matched

↓

negotiating

↓

terms_agreed

↓

payment_coordination

↓

completed



Inventory:



Deal creation

→ reservedQuantity increases



Deal completed

→ quantity decreases

→ reservedQuantity decreases



Deal cancelled

→ reservedQuantity decreases

--------------------------------------------------------------------------

*/

export const updateDealStatus = async (req, res) => {
try {
const { dealId } = req.params;

const { status, paymentStatus } = req.body || {};

/*
|--------------------------------------------------------------------------
| Allowed statuses
|--------------------------------------------------------------------------
*/

const allowedStatuses = [
  "matched",
  "negotiating",
  "terms_agreed",
  "payment_coordination",
  "completed",
  "cancelled",
];

if (!allowedStatuses.includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid deal status",
  });
}

/*
|--------------------------------------------------------------------------
| Find deal
|--------------------------------------------------------------------------
*/

const deal = await Deal.findById(dealId);

if (!deal) {
  return res.status(404).json({
    success: false,
    message: "Deal not found",
  });
}

/*
|--------------------------------------------------------------------------
| Remember previous status
|--------------------------------------------------------------------------
*/

const previousStatus = deal.status;
const previousPaymentStatus = deal.paymentStatus;

/*
|--------------------------------------------------------------------------
| Prevent invalid state changes
|--------------------------------------------------------------------------
*/

const statusOrder = [
  "matched",
  "negotiating",
  "terms_agreed",
  "payment_coordination",
  "completed",
];

/*
|--------------------------------------------------------------------------
| Do not allow completed → cancelled
|--------------------------------------------------------------------------
*/

if (previousStatus === "completed" && status === "cancelled") {
  return res.status(400).json({
    success: false,
    message: "Completed deals cannot be cancelled",
  });
}

if (status === "completed" && paymentStatus !== "received" && previousPaymentStatus !== "received") {
  return res.status(400).json({
    success: false,
    message: "A deal cannot be completed until payment is confirmed as received",
  });
}

/*
|--------------------------------------------------------------------------
| Do not move ordinary deals backwards
|--------------------------------------------------------------------------
*/

if (previousStatus !== "cancelled" && status !== "cancelled") {
  const currentIndex = statusOrder.indexOf(previousStatus);

  const nextIndex = statusOrder.indexOf(status);

  if (currentIndex !== -1 && nextIndex !== -1 && nextIndex < currentIndex) {
    return res.status(400).json({
      success: false,
      message: "Deal status cannot move backwards",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Validate payment status
|--------------------------------------------------------------------------
*/

const allowedPaymentStatuses = [
  "pending",
  "initiated",
  "received",
  "failed",
];

if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
  return res.status(400).json({
    success: false,
    message: "Invalid payment status",
  });
}

/*
|--------------------------------------------------------------------------
| Detect state transitions
|--------------------------------------------------------------------------
*/

const isCompletingNow =
  status === "completed" && previousStatus !== "completed";

const isCancellingNow =
  status === "cancelled" && previousStatus !== "cancelled";

/*
|--------------------------------------------------------------------------
| Validate quantity
|--------------------------------------------------------------------------
*/

const dealQuantity = Number(deal.quantity || 0);

if (
  (isCompletingNow || isCancellingNow) &&
  (!Number.isFinite(dealQuantity) || dealQuantity <= 0)
) {
  return res.status(400).json({
    success: false,
    message: "Invalid deal quantity",
  });
}

/*
|--------------------------------------------------------------------------
| COMPLETE DEAL
|--------------------------------------------------------------------------
*/

if (isCompletingNow) {
  /*
  |--------------------------------------------------------------------------
  | Consume listing inventory
  |--------------------------------------------------------------------------
  |
  | New reservation-aware deals:
  |   quantity          -= dealQuantity
  |   reservedQuantity  -= dealQuantity
  |
  | Legacy deals:
  |   inventoryReserved is false, but the listing still needs to consume
  |   the completed quantity. This keeps old deals from leaving the
  |   marketplace showing inventory that has already been sold.
  |--------------------------------------------------------------------------
  */

  const listingBeforeCompletion =
    await SellerListing.findById(deal.listingId);

  if (!listingBeforeCompletion) {
    return res.status(404).json({
      success: false,
      message: "Listing associated with this deal was not found",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Establish immutable total listed quantity for older listings
  |--------------------------------------------------------------------------
  |
  | New listings already have totalQuantity populated by the model hook.
  | For an older listing without totalQuantity, the current quantity is
  | the best known original quantity at this transition point.
  |--------------------------------------------------------------------------
  */

  if (listingBeforeCompletion.totalQuantity == null) {
    listingBeforeCompletion.totalQuantity =
      Number(listingBeforeCompletion.quantity || 0);

    await listingBeforeCompletion.save();
  }

  if (deal.inventoryReserved) {
    const listing = await SellerListing.findOneAndUpdate(
      {
        _id: deal.listingId,

        $expr: {
          $gte: [
            {
              $ifNull: ["$reservedQuantity", 0],
            },
            dealQuantity,
          ],
        },

        quantity: {
          $gte: dealQuantity,
        },
      },
      {
        $inc: {
          quantity: -dealQuantity,
          reservedQuantity: -dealQuantity,
        },
      },
      {
        new: true,
      },
    );

    if (!listing) {
      return res.status(409).json({
        success: false,
        message: "Unable to consume reserved listing inventory",
      });
    }

    if (listing.quantity === 0) {
      listing.status = "sold";
      await listing.save();
    }

    deal.inventoryReserved = false;
  } else {
    /*
    |--------------------------------------------------------------------------
    | Legacy completion path
    |--------------------------------------------------------------------------
    |
    | Older deals can reach completion with inventoryReserved=false.
    | Those deals were previously left untouched by the old controller,
    | which is the reason a completed 20 MT deal could leave a 100 MT
    | listing showing 100 MT available.
    |--------------------------------------------------------------------------
    */

    const listing = await SellerListing.findOneAndUpdate(
      {
        _id: deal.listingId,
        quantity: {
          $gte: dealQuantity,
        },
      },
      {
        $inc: {
          quantity: -dealQuantity,
        },
      },
      {
        new: true,
      },
    );

    if (!listing) {
      return res.status(409).json({
        success: false,
        message: "Unable to consume legacy listing inventory",
      });
    }

    if (listing.quantity === 0) {
      listing.status = "sold";
      await listing.save();
    }
  }

  deal.completedAt = new Date();
}

/*
|--------------------------------------------------------------------------
| CANCEL DEAL
|--------------------------------------------------------------------------
*/

if (isCancellingNow) {
  /*
  |--------------------------------------------------------------------------
  | Release reservation only if this deal currently
  | holds one.
  |--------------------------------------------------------------------------
  */

  if (deal.inventoryReserved && deal.listingId) {
    const listing = await SellerListing.findOneAndUpdate(
      {
        _id: deal.listingId,

        $expr: {
          $gte: [
            {
              $ifNull: ["$reservedQuantity", 0],
            },
            dealQuantity,
          ],
        },
      },
      {
        $inc: {
          reservedQuantity: -dealQuantity,
        },
      },
      {
        new: true,
      },
    );

    if (!listing) {
      return res.status(409).json({
        success: false,
        message: "Unable to release reserved listing inventory",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | If the listing was previously marked sold
    | but still has quantity, restore active status.
    |--------------------------------------------------------------------------
    */

    if (listing.status === "sold" && listing.quantity > 0) {
      listing.status = "active";

      await listing.save();
    }

    deal.inventoryReserved = false;
  }
}

/*
|--------------------------------------------------------------------------
| Update deal status
|--------------------------------------------------------------------------
*/

deal.status = status;

/*
|--------------------------------------------------------------------------
| Update payment status
|--------------------------------------------------------------------------
*/

if (paymentStatus) {
  deal.paymentStatus = paymentStatus;
}

/*
|--------------------------------------------------------------------------
| Save deal
|--------------------------------------------------------------------------
*/

await deal.save();

await createActivityLog({
  actorId: req.user?._id,
  action: "deal_status_changed",
  entityType: "deal",
  entityId: deal._id,
  before: {
    status: previousStatus,
    paymentStatus: previousPaymentStatus,
  },
  after: {
    status: deal.status,
    paymentStatus: deal.paymentStatus,
  },
  metadata: {
    quantity: deal.quantity,
    agreedPrice: deal.agreedPrice,
    commissionRate: deal.commissionRate,
    commissionAmount: deal.commissionAmount,
    inventoryReserved: deal.inventoryReserved,
  },
});

/*
|--------------------------------------------------------------------------
| Keep PurchaseRequest in sync
|--------------------------------------------------------------------------
|
| Requirement-based deals have requestId = null.
| Therefore we skip this completely for those deals.
|--------------------------------------------------------------------------
*/

if (deal.requestId) {
  const request = await PurchaseRequest.findById(deal.requestId);

  if (request) {
    const requestStatusMap = {
      matched: "matched",

      negotiating: "negotiating",

      terms_agreed: "approved",

      payment_coordination: "approved",

      completed: "completed",

      cancelled: "cancelled",
    };

    const nextRequestStatus = requestStatusMap[status];

    if (nextRequestStatus) {
      request.status = nextRequestStatus;

      await request.save();
    }
  }
}

await notifyDealStatusChange({
  deal,
  status: deal.status,
  paymentStatus: deal.paymentStatus,
  actor: req.user?._id || null,
});

/*
|--------------------------------------------------------------------------
| Return updated deal
|--------------------------------------------------------------------------
*/

return res.status(200).json({
  success: true,
  message: "Deal updated successfully",
  deal,
});

} catch (error) {
console.error("Update deal status error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to update deal",
});

}
};

/*

GET SELLER DEALS

--------------------------------------------------------------------------



Sellers only see their own deals.

Buyer private contact information is never returned.

--------------------------------------------------------------------------

*/

export const getSellerDeals = async (req, res) => {
try {
const deals = await Deal.find({
sellerId: req.user._id,
})
.populate(
"listingId",
"category quantity price location complianceYear validTill reservedQuantity",
)
.populate("requestId", "quantity status notes createdAt")
.populate(
"requirementId",
"quantity matchedQuantity remainingQuantity status",
)
.sort({
createdAt: -1,
})
.lean();

const sellerDeals = deals.map((deal) => ({
  _id: deal._id,

  listing: deal.listingId
    ? {
        _id: deal.listingId._id,

        category: deal.listingId.category,

        quantity: deal.listingId.quantity,

        totalQuantity:
          deal.listingId.totalQuantity ??
          deal.listingId.quantity,

        reservedQuantity: deal.listingId.reservedQuantity || 0,

        availableQuantity: Math.max(
          0,
          Number(deal.listingId.quantity || 0) -
            Number(deal.listingId.reservedQuantity || 0),
        ),

        price: deal.listingId.price,

        location: deal.listingId.location,

        complianceYear: deal.listingId.complianceYear,

        validTill: deal.listingId.validTill,
      }
    : null,

  quantity: deal.quantity,

  agreedPrice: deal.agreedPrice,

  commissionRate: deal.commissionRate,

  commissionAmount: deal.commissionAmount,

  serviceFee: deal.serviceFee,

  creditSubtotal: deal.creditSubtotal,

  finalAmount: deal.finalAmount,

  status: deal.status,

  paymentStatus: deal.paymentStatus,

  inventoryReserved: Boolean(deal.inventoryReserved),

  notes: deal.notes || "",

  createdAt: deal.createdAt,

  completedAt: deal.completedAt || null,
}));

return res.status(200).json({
  success: true,
  count: sellerDeals.length,
  deals: sellerDeals,
});

} catch (error) {
console.error("Get seller deals error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to fetch seller deals",
});

}
};

/*

GET BUYER DEALS

--------------------------------------------------------------------------



Buyers only see their own deals.

Seller private contact information is never returned.

--------------------------------------------------------------------------

*/

export const getBuyerDeals = async (req, res) => {
try {
const deals = await Deal.find({
buyerId: req.user._id,
})
.populate(
"listingId",
"category quantity price location complianceYear validTill reservedQuantity",
)
.populate(
"requirementId",
"quantity matchedQuantity remainingQuantity status",
)
.sort({
createdAt: -1,
})
.lean();

const buyerDeals = deals.map((deal) => ({
  _id: deal._id,

  listing: deal.listingId
    ? {
        _id: deal.listingId._id,

        category: deal.listingId.category,

        quantity: deal.listingId.quantity,

        totalQuantity:
          deal.listingId.totalQuantity ??
          deal.listingId.quantity,

        reservedQuantity: deal.listingId.reservedQuantity || 0,

        availableQuantity: Math.max(
          0,
          Number(deal.listingId.quantity || 0) -
            Number(deal.listingId.reservedQuantity || 0),
        ),

        price: deal.listingId.price,

        location: deal.listingId.location,

        complianceYear: deal.listingId.complianceYear,

        validTill: deal.listingId.validTill,
      }
    : null,

  quantity: deal.quantity,

  agreedPrice: deal.agreedPrice,

  commissionRate: deal.commissionRate,

  commissionAmount: deal.commissionAmount,

  serviceFee: deal.serviceFee,

  creditSubtotal: deal.creditSubtotal,

  finalAmount: deal.finalAmount,

  status: deal.status,

  paymentStatus: deal.paymentStatus,

  inventoryReserved: Boolean(deal.inventoryReserved),

  notes: deal.notes || "",

  createdAt: deal.createdAt,

  completedAt: deal.completedAt || null,
}));

return res.status(200).json({
  success: true,
  count: buyerDeals.length,
  deals: buyerDeals,
});

} catch (error) {
console.error("Get buyer deals error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to fetch buyer deals",
});

}
};