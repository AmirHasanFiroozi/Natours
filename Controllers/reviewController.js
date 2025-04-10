const Review = require('../Model/reviewModel');
// const catchAsync = require('../utilities/catchAsync');
const { deleteOne, createOne, getOne, getAll, updateOne } = require('./handleFactory');

exports.GetAllReviews = getAll(Review);

exports.setTourAndUserIds = (req, res, next) => {
  /// Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = createOne(Review);

exports.updateReviews = updateOne(Review)

exports.getTourReviews = getAll(Review)

exports.deleteReview = deleteOne(Review);

exports.getReview = getOne(Review);

