import Deal from "../models/Deal.js";
import SellerListing from "../models/SellerListing.js";
import User from "../models/User.js";

export const getAdminReport = async (req, res) => {
  try {
    const [
      dealSummary,
      listingSummary,
      userSummary,
      monthlyDeals,
      statusBreakdown,
      categoryBreakdown,
    ] = await Promise.all([
      Deal.aggregate([
        {
          $group: {
            _id: null,
            totalDeals: { $sum: 1 },
            completedDeals: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  1,
                  0,
                ],
              },
            },
            cancelledDeals: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "cancelled"] },
                  1,
                  0,
                ],
              },
            },
            totalGMV: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$quantity", 0] },
                  { $ifNull: ["$agreedPrice", 0] },
                ],
              },
            },
            totalCommission: {
              $sum: {
                $ifNull: ["$commissionAmount", 0],
              },
            },
          },
        },
      ]),

      SellerListing.aggregate([
        {
          $group: {
            _id: null,
            totalListings: { $sum: 1 },
            activeListings: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "active"] },
                  1,
                  0,
                ],
              },
            },
            pendingListings: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "pending_review"] },
                  1,
                  0,
                ],
              },
            },
            rejectedListings: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "rejected"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            buyers: {
              $sum: {
                $cond: [
                  { $eq: ["$role", "buyer"] },
                  1,
                  0,
                ],
              },
            },
            sellers: {
              $sum: {
                $cond: [
                  { $eq: ["$role", "seller"] },
                  1,
                  0,
                ],
              },
            },
            admins: {
              $sum: {
                $cond: [
                  { $eq: ["$role", "admin"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      Deal.aggregate([
        {
          $match: {
            createdAt: {
              $exists: true,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            deals: { $sum: 1 },
            gmv: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$quantity", 0] },
                  { $ifNull: ["$agreedPrice", 0] },
                ],
              },
            },
            commission: {
              $sum: {
                $ifNull: ["$commissionAmount", 0],
              },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      Deal.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      SellerListing.aggregate([
        {
          $group: {
            _id: "$category",
            listings: { $sum: 1 },
            quantity: {
              $sum: {
                $ifNull: ["$quantity", 0],
              },
            },
          },
        },
        {
          $sort: {
            listings: -1,
          },
        },
      ]),
    ]);

    const summary = {
      totalDeals: dealSummary[0]?.totalDeals || 0,
      completedDeals:
        dealSummary[0]?.completedDeals || 0,
      cancelledDeals:
        dealSummary[0]?.cancelledDeals || 0,
      totalGMV: dealSummary[0]?.totalGMV || 0,
      totalCommission:
        dealSummary[0]?.totalCommission || 0,

      totalListings:
        listingSummary[0]?.totalListings || 0,
      activeListings:
        listingSummary[0]?.activeListings || 0,
      pendingListings:
        listingSummary[0]?.pendingListings || 0,
      rejectedListings:
        listingSummary[0]?.rejectedListings || 0,

      totalUsers:
        userSummary[0]?.totalUsers || 0,
      buyers: userSummary[0]?.buyers || 0,
      sellers: userSummary[0]?.sellers || 0,
      admins: userSummary[0]?.admins || 0,
    };

    const monthly = monthlyDeals.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      deals: item.deals,
      gmv: item.gmv,
      commission: item.commission,
    }));

    const statuses = statusBreakdown.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    const categories = categoryBreakdown.map((item) => ({
      category: item._id || "Unknown",
      listings: item.listings,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      success: true,
      summary,
      monthly,
      statuses,
      categories,
    });
  } catch (error) {
    console.error(
      "Get admin report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate admin report",
    });
  }
};