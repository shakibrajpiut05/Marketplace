import ActivityLog from "../models/ActivityLog.js";

export const createActivityLog = async ({
  actorId,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
  metadata = null,
}) => {
  try {
    if (
      !actorId ||
      !action ||
      !entityType ||
      !entityId
    ) {
      console.warn(
        "Activity log skipped: missing required fields"
      );

      return null;
    }

    return await ActivityLog.create({
      actorId,
      action,
      entityType,
      entityId,
      before,
      after,
      metadata,
    });
  } catch (error) {
    // Audit logging should never break the main business operation.
    console.error(
      "Create activity log error:",
      error
    );

    return null;
  }
};