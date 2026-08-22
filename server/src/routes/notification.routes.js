import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Notification routes
|--------------------------------------------------------------------------
| All notification endpoints require an authenticated user.
| The protect middleware loads the logged-in user into req.user.
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getNotifications,
);

router.get(
  "/unread-count",
  protect,
  getUnreadNotificationCount,
);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsRead,
);

router.patch(
  "/:notificationId/read",
  protect,
  markNotificationRead,
);

export default router;