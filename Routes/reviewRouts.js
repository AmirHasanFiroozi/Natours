const express = require('express');
const {
  GetAllReviews,
  createReview,
  deleteReview,
  setTourAndUserIds,
  getReview,
  updateReviews,
} = require('../Controllers/reviewController');
const { protect, restrictTo } = require('../Controllers/authController');

/// { mergeParams : true } because we want to use parameter in merging routes in another route (tour route)
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(GetAllReviews)
  .post(restrictTo('user'), setTourAndUserIds , createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo("admin","user"),deleteReview)
  .patch(restrictTo("admin","user"),updateReviews);

module.exports = router;

