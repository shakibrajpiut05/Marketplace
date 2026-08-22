import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";

export const getActivityLogs = async (
  req,
  res
) => {
  try {
    const {
      entityType,
      action,
      actorId,
      entityId,
      limit = 50,
    } = req.query;

    const parsedLimit = Math.min(
      Math.max(Number(limit) || 50, 1),
      200
    );

    const filter = {};

    if (entityType) {
      filter.entityType = entityType;
    }

    if (action) {
      filter.action = action;
    }

    if (
      actorId &&
      mongoose.Types.ObjectId.isValid(actorId)
    ) {
      filter.actorId = actorId;
    }

    if (
      entityId &&
      mongoose.Types.ObjectId.isValid(entityId)
    ) {
      filter.entityId = entityId;
    }

    const logs = await ActivityLog.find(filter)
      .populate(
        "actorId",
        "name company email role"
      )
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error(
      "Get activity logs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
    });
  }
};