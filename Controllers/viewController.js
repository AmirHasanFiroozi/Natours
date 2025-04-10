const Tour = require('../Model/tourModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getOverView = catchAsync(async (req, res, next) => {
  /// 1- Get tours data from the collections
  const tours = await Tour.find();

  /// 2- Build template
  /// 3- Render that template using tour dat from 1
  res.status(200).render('overview', { title: 'All tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { tourSlug } = req.params;
  const tour = await Tour.findOne({ slug: tourSlug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) next(new AppError('tour is not found', 404));

  res.status(200).render('tour', { title: `${tour.name} tour`, tour });
});

exports.loginController = (req, res, next) => {
  res.status(200).render('login');
};

exports.getMe = (req, res, next) => {
  res.status(200).render('me', { title: `Your Account` });
};

/// updating user data with base html form tag
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   /// from data is in req.user now 😁
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   );
//   res.status(200).render('me', 
//     {
//        title: `Your Account`,
//        /// user that coming from protect middleware is not the updated user
//        user : updatedUser 
//       });
// });