import multer from "multer";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (error, req, res, _next) => {
  const status = Number.isInteger(error?.statusCode)
    ? error.statusCode
    : Number.isInteger(error?.status)
      ? error.status
      : 500;

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 10 MB."
        : "File upload failed. Please check the file and try again.";

    return res.status(400).json({
      success: false,
      code: "FILE_UPLOAD_ERROR",
      message,
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "One or more submitted fields are invalid.",
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      code: "INVALID_IDENTIFIER",
      message: "One or more identifiers are invalid.",
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      code: "DUPLICATE_RESOURCE",
      message: "This resource already exists.",
    });
  }

  if (status >= 500) {
    console.error("Unhandled API error:", error);
  } else {
    console.warn("API error:", error?.message || error);
  }

  const response = {
    success: false,
    code: error?.code || "INTERNAL_SERVER_ERROR",
    message:
      status >= 500
        ? "An unexpected server error occurred. Please try again later."
        : error?.message || "Request failed",
  };

  return res.status(status).json(response);
};
