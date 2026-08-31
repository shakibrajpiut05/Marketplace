import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerListing",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

watchlistSchema.index({ buyerId: 1, listingId: 1 }, { unique: true });
watchlistSchema.index({ buyerId: 1, createdAt: -1 });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

export default Watchlist;
