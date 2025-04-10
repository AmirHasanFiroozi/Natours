const { default: mongoose } = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'required can not be empty'],
    },
    rating: {
      type: Number,
      min: [0, 'a review should be grathet than 0'],
      max: [5, 'a review should be less than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tour',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre('save', async function(next) {
  const existingReview = await this.constructor.findOne({
    user: this.user,
    tour: this.tour,
    _id: { $ne: this._id } // Exclude current doc when updating
  });
  
  if (existingReview) {
    const err = new Error('User can only write one review per tour');
    return next(err);
  }
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// In Mongoose, static methods are functions that are defined on the model itself (the constructor) rather than on individual documents. They are useful for performing operations that involve the entire collection or multiple documents, rather than a single document.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  /// this here related to the model itself
  /// aggregations always return a Promise
  const stats = await this.aggregate([
    {
      // Filters reviews where tour field matches tourId.
      // Similar to Review.find({ tour: tourId })
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        averageRatings: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: stats[0].averageRatings,
      ratingQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingQuantity: 0,
    });
  }
};

/// for create
/// why we use post here instead of pre? Because we want all data after saving new data in pre we won't get the current review but post because executed after saving data in dataBase we give all the reviews here OK
reviewSchema.post('save', function () {
  /// this here points to current review

  /// we can
  // Review.calcAverageRatings(this.tour);
  /// but the problem here that is Review here is not declaring yet and we cant use that
  /// we have one wat to access to the model here
  this.constructor.calcAverageRatings(this.tour);
});

/// for update and delete
/// findOnrAndUpdate
/// findOneAndDelete
/// but here we can't use post because in post we don't access to the query so we should first use pre to access to the query for getting tour id
reviewSchema.pre(/^findOneAnd/, async function (next) {
  /// if we straightly use await this.findOne() we ger this error "Query was already executed"
  /// ===mongo project file four===
  const query = this.clone();
  this.r = await query.findOne();
  next();
});
/// ===mongo project file five===

/// after that we use post to call the calcAverageRating function and pass the tour id for calculating stuff that we want
reviewSchema.post(/^findOneAnd/, async function () {
  // const query = this.clone();
  // this.r = await query.findOne();
  /// does not work here because the query has already executed
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('review', reviewSchema);

module.exports = Review;
