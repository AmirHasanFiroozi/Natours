const path = require('path');
const hpp = require('hpp');

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const compression = require('compression');
const AppError = require('./utilities/appError');
const errorHandlerFunction = require('./Controllers/errorControler');
const userRouter = require('./Routes/userRouts');
const tourRouter = require('./Routes/tourRouts');
const reviewsRouter = require('./Routes/reviewRouts');
const viewRouter = require('./Routes/viewRouts');

const app = express();

/// === number 9 ===
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//⁡⁢⁣⁢------------------------ENV VARIABLE------------------------⁡
//‍‍‍ ‍‍for see all of the environment variables
// ⁡⁢⁢⁢console.log(process.env);⁡
// 𝗛𝗼𝘄 𝗰𝗮𝗻 𝗜 𝗮𝗱𝗱 𝘀𝗼𝗺𝗲 𝗲𝗻𝘃𝗶𝗿𝗼𝗻𝗺𝗲𝗻𝘁 𝘃𝗮𝗿𝗶𝗮𝗯𝗹𝗲𝘀 𝘁𝗼 𝗼𝘂𝗿 𝗰𝗼𝗱𝗲
// 1- in the terminal before the start app you can specify new variable like this :
// $env:NAME=amir; $env:FAMILY=Firoozi; npm run start
// but whenever you want to create new variable you should do that? absolutely not you should create a config.env file and create all variable you want there

//⁡⁢⁣⁢------------------------MIDDLEWARES------------------------⁡
// 𝗺𝗶𝗱𝗱𝗹𝗲𝘄𝗮𝗿𝗲 : 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝗯𝗲𝘁𝘄𝗲𝗲𝗻 𝗿𝗲𝗾 𝗮𝗻𝗱 𝗿𝗲𝘀 𝘁𝗵𝗮𝘁 𝗺𝗼𝗱𝗶𝗳𝘆 𝘁𝗵𝗲 𝗱𝗮𝘁𝗮
// we use ⁡⁢⁢⁢app.use⁡ to add middleware to middleware stack in Express
// it's important to know the 𝗺𝗶𝗱𝗱𝗹𝗲𝘄𝗮𝗿𝗲𝘀 𝗮𝗿𝗲 𝗲𝘅𝗲𝗰𝘂𝘁𝗲𝗱 𝗶𝗻 𝗮 𝗿𝗼𝘄 𝘁𝗵𝗮𝘁 𝘆𝗼𝘂𝗿 𝗰𝗼𝗱𝗲𝘀 𝘄𝗿𝗶𝘁𝘁𝗲𝗻

if (process.env.NODE_ENV === 'development') {
  // this is a 3-party middleware that help us to see the result of the request in the terminal
  app.use(morgan('dev'));
}

/// security middlewares
/// === number 10 ===

/// request limiter
/// this means you can send 100 request with same id in one hour
const limiter = rateLimit({
  /// this number is depend on your application
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP ,please try again in an hour',
  headers: true,
});
/// this middleware is implement for all route that start with /api
app.use('/api', limiter);

/// A middleware for set HTTP security headers
// app.use(helmet());

/// A body parser that read data from the body into req.body
app.use(express.json({ limit: '10kb' }));
/// This line of code configures Express.js middleware to handle URL-encoded form data (like data submitted from HTML forms)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
/// A cookie parser that parse the cookie that comes from the frontend
app.use(cookieParser());

/// Data sanitization against NoSQL query injection
/// this middleware is simply clean all the signs like ,.!@#$%^&** and etc.... so some weird things like "email : {"$gr" : ""}" is no longer valid here
app.use(mongoSanitize());

/// Data sanitization against XSS
/// this middleware convert all htmls bad code to something safe
app.use(xss());

/// prevent parameter pollution
/// this prevent to have multiple qery params in the qury (this can be dangress and should prevent)
app.use(
  hpp({
    /// filed that you want to be allow to have them more that one time in the query
    whitelist: [
      'duration',
      'raitingQuantity',
      'raitingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// with this static file we access to all of the file inside the folder we link here in the URL
app.use(express.static(`${__dirname}/public`));

app.use(compression());

// test middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   // console.log(req.cookies);
//   next();
// });

//⁡⁢⁣⁢-----------------------ROUTES------------------------⁡
/// show the user interface
app.use('/', viewRouter);
// 𝗺𝗶𝗱𝗱𝗹𝗲𝘄𝗮𝗿𝗲 𝘁𝗵𝗮𝘁 𝗰𝗼𝗻𝘁𝗮𝗶𝗻𝘀 𝗼𝘂𝗿 𝗿𝗼𝘂𝘁𝗲 𝗮𝗻𝗱 𝘁𝗵𝗲 𝗳𝗶𝗹𝗲 𝘄𝗲 𝘄𝗮𝗻𝘁 𝘁𝗼 𝘀𝗲𝗲 𝗶𝗻 𝘁𝗵𝗮𝘁 𝗿𝗼𝘂𝘁𝗲
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewsRouter);

// 𝗜𝗳 𝘄𝗲 𝘄𝗿𝗶𝘁𝗲 𝗮 𝗺𝗶𝗱𝗱𝗹𝗲𝘄𝗮𝗿𝗲 𝗵𝗲𝗿𝗲 𝘄𝗲 𝗵𝗮𝗻𝗱𝗹𝗲 𝗼𝘁𝗵𝗲𝗿 𝗻𝗼𝘁 𝘃𝗮𝗹𝗶𝗱 𝗿𝗼𝘂𝘁𝗲𝘀
// Because when route is not valid then code arrive to here and run this middleware
// ⁡⁢⁢⁢app.all()⁡ means all the http methods that we have
app.all('*', (req, res, next) => {
  // When we use new middleware and the next has parameter(It's not matter what kind of parameter does it have) next function automatically is error function
  // You should pass err as a param in next function when you want to go to the error
  const error = new AppError(
    `the (${req.originalUrl}) is not a valid url`,
    404,
  );
  next(error);
});

// when you use a ⁡⁢⁢⁢app.use()⁡ function with a function with four parameter err,req,res,next express automatically know that is a error middleware
app.use(errorHandlerFunction);

// export app for use in the server to listen to the server
module.exports = app;
