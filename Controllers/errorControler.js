const AppError = require('../utilities/appError');

//----------------------Handling Errors----------------------------

const handleCastErrors = (error) => {
  const message = `Invalid ${error.path} = ${error.value}`;
  return new AppError(message, 400);
};

const handelDuplicateKeyError = (error) => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate value : ${value} please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrors = (error) => {
  const errors = Object.values(error.errors)
    .map((el) => el.message)
    .join(' | ');
  return new AppError(`${errors}`, 400);
};

const handelJsonWebTokenError = () =>
  new AppError('the token is not correct. Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('the token was expired please log in again', 401);

//----------------------Sending Errors----------------------------

/// sending errors in Development
const sendErrorDev = (err, req, res) => {
  /// for APIs
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err: err,
      message: err.message,
      stack: err.stack,
    });
  }
  /// for render website
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    message: err.message,
  });
};

/// sending errors in Production
const sendErrorPro = (err, req, res) => {
  /// for APi
  if (req.originalUrl.startsWith('/api')) {
    /// A) If error is an operational error we want to message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) But if the error is programming error or other unknown error you shouldn't sent it to the client
    // 1) log the error in the console
    console.error('ERROR💥💥', err);
    // 2) sent general message to the client
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }
  /// for render website
  /// A) If error is an operational error we want to message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      message: err.message,
    });
  }
  // B) But if the error is programming error or other unknown error you shouldn't sent it to the client
  // 1) log the error in the console
  console.error('ERROR💥💥', err);
  // 2) render general message to the client
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    message: 'something went wrong try again later',
  });
};

//----------------------next(something) you code comes here----------------------------

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {
      ...err,
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      errmsg: err.errmsg,
    };

    if (error.code === 11000) error = handelDuplicateKeyError(error);
    if (error.name === 'CastError') error = handleCastErrors(error);
    if (error.name === 'ValidationError') error = handleValidationErrors(error);
    if (error.name === 'JsonWebTokenError') error = handelJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorPro(error, req, res);
  }
};
