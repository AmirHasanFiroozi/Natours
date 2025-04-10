const { default: mongoose } = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

///---------------------------------SCHEMA------------------------------------------

/// ✅ Creates a Schema → tourSchema is a blueprint for how the "Tour" documents should be structured in MongoDB.
/// schema === how a document should look like
/// === number 2  ===
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      /// fact : every field that be unique mongoose automatically create a index for that
      trim: true,
      maxlength: [40, "A tour name can't have more than 40 character"],
      minlength: [5, 'A tour name must have more that 5 characters'],
      /// just letter is allowed
      // validate : [validator.isAlpha , "A tour's name must only contain letter"] ,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration '],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message:
          "the tour's difficulty must be three value 'easy' 'medium' 'difficult'",
      },
    },
    /// Here if you see rating quantity and rating average are not a real number because we should calculate these tow from data that we have and put that value on them OK? So have should we do for calculating them?
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [0, 'rating muse be grater than zero'],
      max: [5, 'rating must be less than five'],
      set: (val) => val.toFixed(1),
    },
    ratingQuantity: {
      type: Number,
      default: 0,
      min: [0, 'rating muse be grater than zero'],
      max: [5, 'rating must be less than five'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          /// in custom validators if you want to send error you should return false if don't you should return true
          /// this points to current doc in new document creation (new price value)
          return this.price > val;
        },
        message: 'the priceDiscount ({VALUE}) muse be less than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summery'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      /// we actually put the image somewhere in the files and store image address in the database
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    /// I want save images in an Array of string and this how we do that in mongoose schema
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      /// when you don't want to send this field to the client (hide the field with 'select : false')
      select: false,
    },
    startDates: [Date],
    secure: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      /// GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'POint',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    /// for embedding users in related tour
    // guys: Array ,
    /// in this way we can specify the child referencing
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    // In Mongoose schema options, these two lines enable virtuals to be included when converting a Mongoose document to JSON or a plain JavaScript object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

///---------------------------------INDEXES------------------------------------------

/// create index for one field
tourSchema.index({ price: -1 });
/// after you specify this line of code when you use this query '{{URL}}api/v1/tours?price[lt]=1000' you get this in Model.filteringResult.explain() :
/// "nReturned": 3,
/// "totalDocsExamined": 3,
/// now you can see the number of result and number of items that the mongoDB examined for getting total result is equal
// tourSchema.index({price : 1 , rating : -1 })
// The 1 and -1 specify the sort order for the fields in the index:
///  (Ascending) → Sorts the field in ascending order (A-Z, 0-9).
/// (Descending) → Sorts the field in descending order (Z-A, 9-0).
/// What Are Indexes in MongoDB?
/// Indexes are like a "table of contents" for your database. They help MongoDB find data much faster without scanning every document (like flipping through an entire book to find a single page).

/// How Do Indexes Work? (Simple Example)
// Imagine you have a tours collection with 10,000 tours:
// [
//   { _id: 1, name: "Forest Hike", price: 100, rating: 4.5 },
//   { _id: 2, name: "Mountain Trek", price: 200, rating: 4.8 },
//   ...
//   { _id: 10000, name: "Desert Safari", price: 500, rating: 4.2 }
// ]
/// Without an Index (Slow)
/// If you search for price > 300, MongoDB must:
/// Scan every single document (10,000 tours).
/// Check each one to see if price > 300.
/// → Slow! (Like reading an entire book to find a chapter.)

/// With an Index on price (Fast)
/// If you create an index on price:
// tourSchema.index({ price: 1 }); // Ascending order
/// MongoDB builds a sorted list of prices in memory:
/// [100, 150, 200, 250, 300, 350, 400, ...]
/// Now, when you query price > 300:
/// MongoDB jumps straight to 300 in the index (like using a book’s index).
// Only scans documents where price > 300 (maybe just 2,000 out of 10,000).
// → Much faster!

/// But you should be careful because index is
/// === number 1 ===

// tourSchema.index({ slug: 1 });

/// === number 7 ===
tourSchema.index({startLocation : '2dsphere'});

///---------------------------------VIRTUAL------------------------------------------

/// 📌 What is a Virtual in Mongoose Schema?
/// A virtual in Mongoose is a property that is not stored in MongoDB but is computed dynamically when you retrieve documents. Virtuals are useful for derived values, such as full names, computed fields, or related data that doesn't need to be saved in the database.
tourSchema.virtual('durationInWeek').get(function () {
  return this.duration / 7;
});
///🔹 Virtual with Getters & Setters
// userSchema.virtual('fullName')
//   .get(function () {
//     return `${this.firstName} ${this.lastName}`;
//   })
//   .set(function (value) {
//     const parts = value.split(' ');
//     this.firstName = parts[0];
//     this.lastName = parts[1];
//   });
/// virtual are not query so cant use methods like I don't know sort,limit,......
/// use virtual when the operation is belong to the business logic not in the application logic OK?

///virtual populate
tourSchema.virtual('reviews', {
  ref: 'review', // The model to populate from
  foreignField: 'tour', // Field in the review model that references the tour
  localField: '_id', // Field in the tour model that's referenced
});

///------------------------DOCUMENT MIDDLEWARE OR HOOK (MONGOOSE MIDDLEWARE)-----------------------------
/// document middleware runs .save() and .create() date in teh database
/// you can create document middleware with .pre()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/// we can have multiple pre middleware how many you want
// tourSchema.pre('save', (next) => {
//   console.log('doc will be safe ...');
//   next();
// });

/// post middleware is executed after per middleware and in post middleware you can see the final doc
/// after saving doc in the db actually
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

/// middleware for embedding all the users in the related tour
// tourSchema.pre('save' ,async function (next) {
//   const usersPromice = this.guieds.map(async guy => await User.findById(guy));
//   this.guieds = await Promise.all(usersPromice);
//   next();
// })

///-----------------------------QUERY MIDDLEWARE-----------------------------------
/// query middleware is for exact functions that you use in queries
/// the pre middleware happen before all find (or everything you write in the first parameter in the middleware) methods that you use in queries
/// but it doesn't work for findOne you should use :
// tourSchema.pre("find" , function(next){
tourSchema.pre(/^find/, function (next) {
  this.find({ secure: { $ne: true } });
  this.start = Date.now();
  next();
});
/// but post middleware happen after all find (or everything you write in the first parameter in the middleware) methods that you use in queries you can access to the final document in post method
// tourSchema.post(/^find/, function (doc, next) {
//   console.log(
//     `the operation took about ${Date.now() - this.start} millisecond`,
//   );
//    console.log(doc);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

///-------------------------AGGREGATION MIDDLEWARE---------------------------------
/// aggregation middleware is runs exactly before aggregations stage
/// for example in here we have some secret tour that is modify in the find method we want to client can't access to those in aggregations too so
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secure: { $ne: true } } });
//   next();
// });

///---------------------------------MODEL------------------------------------------

/// ✅ What it does:
/// Creates a Model → mongoose.model("Tour", tourSchema) creates a model (like a class) based on the tourSchema.
/// Collection Name → The "Tour" model will be stored in MongoDB as a collection named "tours" (Mongoose automatically converts it to lowercase and plural).
/// Now we can use Tour to create, read, update, and delete tour documents in MongoDB.
/// model === collection
const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;
