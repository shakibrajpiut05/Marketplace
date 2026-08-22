import mongoose from "mongoose";
import Notification from "../models/Notification.js";

/**
 * GET /notifications
 * Query:
 *   limit=50
 *   unreadOnly=true|false
 */
export const getNotifications = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 50, 1),
      100,
    );

    const unreadOnly =
      String(req.query.unreadOnly || "false") === "true";

    const filter = {
      recipient: req.user._id,
    };

    if (unreadOnly) {
      filter.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("actor", "name company role")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),

      Notification.countDocuments({
        recipient: req.user._id,
        read: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/**
 * GET /notifications/unread-count
 */
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};

/**
 * PATCH /notifications/:notificationId/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (
      !notificationId ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notificationId",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: req.user._id,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        },
        {
          new: true,
        },
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

/**
 * PATCH /notifications/read-all
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};