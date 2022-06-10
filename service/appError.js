const appError = (apiState, next) => {
  const error = new Error(apiState.message);
  error.statusCode = apiState.statusCode;
  error.isOperational = true;
  next(error);
};

module.exports = appError;