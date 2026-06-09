/**
 * utils/response.js
 * Standarisasi response API untuk seluruh endpoint.
 */

exports.sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

exports.sendError = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};
