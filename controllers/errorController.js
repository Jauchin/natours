module.exports = (err, req, res, next) => {
  const AppError = require('./../utils/appError');

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 處理 CastError 的函數
  const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
  };
  // 處理 DuplicateField 的函數
  const handleDuplicateFieldDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  };

  const handleJWTError = () =>
    new AppError('Invalid token. Please log in again', 401);
  const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again', 401);

  // // 處理 DuplicateFieldError 的函數
  // const handleDuplicateFieldDB = (err) => {
  //   const value = err.keyValue[Object.keys(err.keyValue)[0]];
  //   const message = `Duplicate field value: ${value}. Please use another value!`;
  //   return new AppError(message, 400);
  // };

  // 處理 ValidationError 的函數
  const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  };

  const sendErrorDev = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      });
    }
    //REMDERED website
    // console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  };
  const sendErrorProd = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
      //(A) Operational, trusted error: send message to client
      if (err.isOperational) {
        return res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
        });
      }

      // (B) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }

    // Rendering website
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later!',
    });
  };

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = Object.assign(err);
    // let error = { ...err };
    // error.message = err.message;
    // let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
