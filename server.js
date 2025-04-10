const mongoose = require('mongoose');
const dotenv = require('dotenv');

/// ⁡⁢⁣⁢----------------------Variable Environment----------------------------⁡

/// connecting variable environment to the config.env file
dotenv.config({ path: './config.env' });
/// we can access to the variable environment with : process.env.VARIABLE-NAME
// console.log(process.env.NODE_ENV);

/// for understanding witch environment you currently in it
// console.log(app.get("env"));

/// ⁡⁢⁣⁡⁢⁣⁢----------------------handel uncaught Exception error for all app----------------------------⁡
// This piece of code is a global error handler for uncaught exceptions in a Node.js application. It ensures that if an exception (synchronous error) is thrown but not caught anywhere in your application, the error is logged, the server is gracefully shut down, and the process is terminated.
process.on('uncaughtException', (err) => {
  console.log('Uncatght Exception💥 Shutting down');
  console.log(err);

  /// we don't use this pattern :
  // server.close(() => {
  //   process.exit(1);
  // });
  /// becuase all the codes here happen syncranousely and we dont have any active request that have not finished yet
  process.exit(1);
});

/// ⁡⁢⁣⁢----------------------import app----------------------------⁡
/// app should import after dotenv config process because in app we want to access to the variables in the config.env file
const app = require('./app');
const AppError = require('./utilities/appError');

/// ⁡⁢⁣⁢----------------------Connecting And Work With MongoDB----------------------------⁡

///🔹 What is Mongoose?
/// Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js. It helps define schemas (structured blueprints) for MongoDB documents and makes interacting with MongoDB easier.
/// connect mongoDB to the our project with mongoose package
/// replace <PASSWORD> with real password in connection string in the config.env file
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

/// when you use localhost
// mongoose.connect(process.env.DATABASE_LOCAL).then(() => console.log("Our project connect to mongoDB successfully"));

/// when you use some cloud space like Atlas
const timeOutPromice = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new AppError('not condected to mongoDB after 10 second', 500));
  }, 10000);
});

Promise.race([
  mongoose
    .connect(DB)
    .then(() => 'Our project connected to MongoDB successfully'),
  timeOutPromice,
])
  .then((message) => console.log(message))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));

/// ⁡⁢⁣⁢----------------------LIstening To The Server----------------------------⁡

/// listening to the server on localhost port:3000 that means your main URL is localhost:3000
/// in general listening to the server is like this :
/// app.listen(your main URL here (if you want localhost you don't need to write anything here) , port here , a call back function that runs whenever listening to the server is start)
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("we're listening to the server");
});

/// ⁡⁢⁣⁢----------------------SERVER ERROR----------------------------⁡

/// 𝗪𝗵𝗮𝘁 𝗶𝘀 𝗽𝗿𝗼𝗰𝗲𝘀𝘀.𝗼𝗻() 𝗱𝗼 ?
/// what does precess.on() do is it do the same as addEventListener do in the js?
/// Yes, you're absolutely correct! process.on() in Node.js is very similar to addEventListener() in JavaScript for the browser. Both are used to listen for events and execute a callback function when those events occur. However, they operate in different environments and are used for different types of events.

/// process.on() in Node.js
/// What it does: process.on() is a method provided by the process object in Node.js. It allows you to listen for system-level events or process-related events in a Node.js application.
/// Purpose: It is used to handle events related to the Node.js process, such as:
/// uncaughtException: When an exception is thrown but not caught.
/// unhandledRejection: When a promise is rejected but not handled.
/// exit: When the Node.js process is about to exit.
/// SIGINT: When the process receives an interrupt signal (e.g., Ctrl+C).
/// SIGTERM: When the process receives a termination signal (e.g., from a process manager).

/// 𝘄𝗵𝗮𝘁 𝗶𝘀 𝘀𝗲𝗿𝘃𝗲𝗿.𝗰𝗹𝗼𝘀𝗲() 𝘄𝗵𝗮𝘁 𝗶𝘀 𝗶𝘁 𝗱𝗼 𝗮𝗻𝗱 𝘄𝗵𝗮𝘁 𝗶𝘀 𝘁𝗵𝗲 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁 𝗯𝗲𝘁𝘄𝗲𝗲𝗻 𝘀𝗲𝗿𝘃𝗲𝗿.𝗰𝗹𝗼𝘀𝗲() 𝗮𝗻𝗱 𝗽𝗿𝗼𝗰𝗲𝘀𝘀.𝗲𝘅𝗶𝘁() 𝗮𝗻𝗱 𝘄𝗵𝗼 𝗰𝗮𝗻 𝘄𝗲 𝘂𝘀𝗲 𝘁𝗵𝗲𝘀𝗲 𝘁𝗼𝘄 𝘁𝗼𝗴𝗲𝘁𝗵𝗲𝗿 ?
/// 1. server.close()
/// server.close() is a method provided by Node.js (specifically for HTTP servers, Express servers, etc.) that stops the server from accepting new connections.
/// However, it allows existing connections (e.g., ongoing requests) to complete before fully shutting down.
/// This is part of a graceful shutdown process, ensuring that the server doesn't abruptly terminate while handling ongoing requests.
/// What happens when server.close() is called?
/// The server stops listening for new requests (e.g., stops listening on the specified port, like 3000).
/// Existing requests are allowed to finish processing.
/// Once all existing connections are closed, the callback function passed to server.close() is executed.

/// 2. process.exit(1)
/// process.exit() is a method that terminates the Node.js process.
/// The argument 1 is the exit code. In Node.js (and most systems), a non-zero exit code (e.g., 1) indicates that the process is exiting due to an error or failure.
/// When process.exit() is called, the Node.js process stops immediately, and no further code is executed.
/// What happens when process.exit(1) is called?
/// The Node.js process stops.
/// Any remaining code in your application is not executed.
/// The server is fully shut down, and the application stops running.

/// 3. Why Combine server.close() and process.exit()?
/// Graceful Shutdown: server.close() ensures that the server stops accepting new requests but allows ongoing requests to complete. This prevents abrupt termination, which could leave users with incomplete responses or cause data corruption.
/// Forceful Termination: After the server has gracefully closed, process.exit(1) ensures that the Node.js process stops completely. This is important because:
/// It frees up system resources (e.g., memory, CPU).
/// It ensures that the application doesn't hang or remain in an inconsistent state.

/// 4. What Does "Exit the Application" Mean?
/// When we say "exit the application," it means:
/// The server stops listening for new requests (e.g., no more incoming HTTP requests are accepted).
/// The Node.js process stops running.
/// The application is no longer active, and the terminal or environment where it was running is freed up.
/// For example:
/// If your server is running on port 3000, after server.close() and process.exit(1), the port 3000 is no longer occupied by your application.
/// If you try to access http://localhost:3000, you'll get an error (e.g., "Connection refused") because the server is no longer running.

/// 5. When Is This Useful?
/// This pattern is commonly used in production applications to handle critical errors (e.g., uncaught exceptions or unhandled rejections) gracefully. For example:
/// If a critical error occurs (e.g., database connection fails, unexpected bug), you don't want the server to continue running in an inconsistent state.
/// Instead, you log the error, shut down the server gracefully, and restart the application (e.g., using a process manager like PM2 or systemd).

/// This piece of code is a global error handler for unhandled promise rejections in a Node.js application.
/// It ensures that if a promise is rejected and the rejection is not properly handled (i.e., no .catch() or try/catch block is used), the application will log the error, gracefully shut down the server, and exit the process.
/// process.on("unhandledRejection", ...)
/// process is a global object in Node.js that provides information about and control over the current Node.js process.
/// unhandledRejection is an event emitted by the process object whenever a promise is rejected but no error handler (.catch() or try/catch) is attached to it.
/// This event is crucial for catching unexpected errors in asynchronous code (e.g., database queries, API calls, etc.).
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejectio💥 Shutting down');
  console.log(err.name, err.message);
  /// server.close(() => { ... })
  /// server.close() stops the server from accepting new connections but allows existing connections to complete.
  /// This is part of a graceful shutdown process, ensuring that the server doesn't abruptly terminate while handling ongoing requests.
  /// The callback function inside server.close() is executed once the server has successfully closed.
  server.close(() => {
    /// process.exit(1)
    /// process.exit(1) terminates the Node.js process.
    /// The argument 1 indicates that the process is exiting with a failure code (non-zero exit codes typically indicate errors)
    /// This ensures that the application stops running after an unhandled rejection, preventing further issues.
    process.exit(1);
  });
});
