// 正式環境錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).send({
      status: false,
      message: err.message
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    res.status(500).send({
      status: false,
      message: '系統錯誤，請洽系統管理員'
    });
  };
};

// 開發環境錯誤
const resErrorDev = (err, res) => {
  console.log(err.stack);
  res.status(err.statusCode).send({
    status: false,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

// express 錯誤處理
const handleError = (err, req, res, next) => {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    return resErrorDev(err, res);
  }
  // prod
  if (err.name === 'ValidationError') {
    const apiDataState = apiState.DATA_MISSING;

    err.statusCode = apiDataState.statusCode;
    err.message = apiDataState.message;
    err.isOperational = true;
    return resValidationError(err, res);
  }

  resErrorProd(err, res);
};

module.exports =  (err, req, res, next) => {
  handleError(err, req, res, next);
};