const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const Email = require('../utilities/email');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    /// cookie can not modify in the browser never client just receive the cookie and send it with all http response and can't access and change it
    httpOnly: true,
  };

  /// cookie always sending in secure way (using HTTPS)
  /// just for production because in development we use http and in http this cookie is not send
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  /// you should write like this :
  /// res.cookie( name , value , cookieOptions);
  res.cookie('jwt', token, cookieOptions);

  /// for removing password from data that we send to the client
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt || undefined,
    role: req.body.role,
  });

  /// send welcome email
  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(user ,url).sendWelcome();

  /// 201 => Created
  sendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  /// 1) check if any email or password exist
  if (!email || !password) {
    /// 400 => Bad request
    return next(new AppError('please provide email and password', 400));
  }

  /// 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('email or password is not exist', 401));
  }

  /// 3) if everything is ok send token to client
  /// 200 => OK
  sendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  /// 1)Getting token and check if it's there
  if (req.cookies?.jwt === 'logout') {
    return next(new AppError('You not login pleas login to access'));
  }
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('you are not logged in please log in to access.', 401),
    );
  }
  /// 2)Verification token

  /// promisify()` in Node. js converts callback-based methods to promise-based, aiding in managing asynchronous code more cleanly
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  /// 3)Check if user still exist
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      /// 401 => Auth Error
      new AppError('the user belonging to this token is not exist', 401),
    );

  /// 4)Check if user changed password after the token was issued
  if (user.changedPassword(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please log in again.'),
    );
  }

  /// 5)If everything is OK put the current user in the req
  req.user = user;
  res.locals.user = user;

  /// If everything is Ok then we can go and see the route ()
  next();
});

exports.loggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      /// 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      /// 2) check if there is any user with this token
      const user = await User.findById(decoded.id);
      if (!user) return next();

      /// 3) Check if user changed password after the token was issued
      if (user.changedPassword(decoded.iat)) {
        return next();
      }

      /// 4) store variable for using them in the frontend
      req.userLoggedInNow = true;
      res.locals.user = user;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

/// we can't pass parameter to middleware function but we need here so how can we do that => with "closure"
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        /// 403 => Forbidden
        new AppError('you do not have permission to perform this action', 403),
      );
    }

    next();
  };

/// implementing forget pass
/// How it work ?
/// We send for use a link in his email
/// The user use that to change the pass and send to us
exports.forgetPass = catchAsync(async (req, res, next) => {
  /// 1) Get user with POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    /// 404 => not found
    return next(new AppError('There is no user with this email address', 404));
  }

  /// 2) Generate the random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  try {
    /// 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpass/${resetToken}`;
    await new Email(user , resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passResetToken = undefined;
    user.passResetExpires = undefined;

    /// 500 => error that happen in server side
    return next(
      new AppError(
        'There is an error in sending the email. try again later!',
        500,
      ),
    );
  }
});

exports.resetPass = catchAsync(async (req, res, next) => {
  /// 1) Get user based on the token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passResetToken: hashedToken,
    passResetExpires: { $gt: Date.now() },
  });

  /// 2) If token has not expired and there is a token then change the password.
  if (!user) {
    return next(new AppError('token is not valid or token was expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passResetToken = undefined;
  user.passResetExpires = undefined;
  await user.save();

  /// 3) Update changePasswordAt property for the user.
  /// 4) Log the user in and send JWT.
  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  /// Question )
  ///-------------------------------------
  /// why we don't use User.findByIdAndUpdate() here ?
  /// For tow reason : 1- the validation between password and password confirm not going to work because the validate is not going to work in update (you can see in user schema the password confirm section I was commented out).
  /// important tip ) DON'T use update for anything related to the password
  /// 2- the to pre save middleware in the userModel is not gona work too (we encoded password in one of those so they're important when you work with password)
  ///-------------------------------------

  /// 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  /// 2) Check if posted current pass word is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('password is not correct', 401));
  }

  /// 3) If so => update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  /// 4) log user in and send jwt
  sendToken(user, 200, res);
});

exports.checkUser = (req, res) => {};
