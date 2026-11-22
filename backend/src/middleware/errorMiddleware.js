const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for ${err.path}`;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(", ");
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File size exceeds the 5MB limit";
  } else if (statusCode >= 500) {
    message = "Internal server error";
  }

  if (statusCode >= 500) {
    console.error("Unhandled request error", {
      method: req.method,
      path: req.originalUrl,
      error: err.message,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
