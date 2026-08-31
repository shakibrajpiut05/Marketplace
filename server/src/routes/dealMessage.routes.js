import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  getMessageThreads,
  getDealMessages,
  createDealMessage,
  markDealMessageRead,
  getUnreadMessageCount,
  markAllDealMessagesRead,
} from "../controllers/dealMessage.controller.js";

const router = express.Router();

router.get("/", protect, getMessageThreads);

router.get(
  "/unread-count",
  protect,
  getUnreadMessageCount,
);

router.patch(
  "/read-all",
  protect,
  markAllDealMessagesRead,
);

router.get(
  "/deal/:dealId",
  protect,
  getDealMessages,
);

router.post(
  "/deal/:dealId",
  protect,
  createDealMessage,
);

router.patch(
  "/:messageId/read",
  protect,
  markDealMessageRead,
);

export default router;