class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    /// means this error happen for a unexpected thing in the client side is not a built in error
    this.isOperational = true;

    /// Is used in Node.js (and JavaScript in general) to customize the stack trace of an error object. Let me break it down for you:
    /// Error.captureStackTrace(targetObject, constructorOpt)
    /// targetObject: The object where the captured stack trace will be stored (usually this when inside a custom error class).
    /// constructorOpt: The function (constructor) to exclude from the stack trace.
    ///🔹 Where is it Used?
    /// This is commonly used inside a custom error class to generate a proper stack trace without including the constructor itself.
    /// 🔹 What Happens Here?
    /// The CustomError class extends Error.
    /// Error.captureStackTrace(this, this.constructor); removes the CustomError constructor from the stack trace.
    /// The stack trace will show only where the error occurred, making debugging cleaner.
    /// 🔹 Without Error.captureStackTrace
    /// If you don’t use Error.captureStackTrace, the constructor (CustomError) will appear in the stack trace, making it longer and potentially harder to read.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
