const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../Model/tourModel');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handleFactory');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price';
  next();
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image please upload an image', 404), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'image', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.image) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.image.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );

  next();
});

// MOVE TO THE 'handleFactory.js'
// exports.getAllTour = catchAsync(async (req, res, next) => {
//   // 𝗘𝗫𝗘𝗖𝗨𝗧𝗘 𝗧𝗛𝗘 𝗤𝗨𝗘𝗥𝗬
//   // ⁡⁢⁢⁢Tour.find(queryObj)⁡ this returns a query and in queries we can do anything we want like sort, limit and ....
//   // but when we await thar query it converts to a object and whit object we can't do stuff like sort limit and .... that built in the mongodb and they're for queries
//   // for these reasons we must store the query in a variable and the object in another
//   const features = new APIFeatures(req.query, Tour.find().populate('reviews'));
//   features.Filter().Sort().FieldLimit().Pagination();
//   const tours = await features.queryData;

//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });
exports.getAllTour = getAll(Tour, 'reviews');

/// MONE TO THE 'handleFactory.js'
// exports.getTour = catchAsync(async (req, res, next) => {
//   // ⁡⁢⁢⁢const tour = await Tour.findOne({_id : req.params.id});⁡
//   const tour = await Tour.findById(req.params.id)
//     // .populate({
//     //   path : 'guieds',
//     //   select : "-__v"
//     // });

//   if (!tour) {
//     return next(new AppError('tour is not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
exports.getTour = getOne(Tour, 'reviews');

/// MOVE TO THE 'handleFactory.js'
// exports.createTour = catchAsync(async (req, res, next) => {
//   // ⁡⁢⁢⁢const newTour = new Tour({⁡
//   //   tour data
//   // ⁡⁢⁢⁢})⁡
//   // ⁡⁢⁢⁢newTour.save()⁡

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
exports.createTour = createOne(Tour);

/// MOVE TO THE 'handlerFactory.js'
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('tour is not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
exports.updateTour = updateOne(Tour);

/// MOVE TO THE 'handlerFactory.js'
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('tour is not found', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: {
//       tour: null,
//     },
//   });
// });
exports.deleteTour = deleteOne(Tour);

/// ===mongo project file three===
exports.getTourState = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      // 𝗙𝗶𝗹𝘁𝗲𝗿 𝘀𝘁𝗮𝗴𝗲
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      // 𝗚𝗿𝗼𝘂𝗽 𝘀𝘁𝗮𝗴𝗲
      $group: {
        // Each field that you pass in _id all the stuff calculate for each field separately
        // For example we have three kind of difficulty here : difficult - easy - medium
        // for easy we have one object like below - for difficult we have one object like below and for medium we have one object like below
        // if we want to have one object for all items we should set '_id : null'
        //⁡⁢⁢⁢ _id : "$difficulty" ,⁡
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        sumRatings: { $sum: '$ratingQuantity' },
        aveRating: { $avg: '$ratingAverage' },
        avePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // 𝗦𝗼𝗿𝘁 𝘀𝘁𝗮𝗴𝗲
      $sort: { avePrice: 1 },
    },
    // {
    // 𝗙𝗶𝗹𝘁𝗲𝗿 𝘀𝘁𝗮𝗴𝗲 (𝗮𝗴𝗮𝗶𝗻 𝗯𝘂𝘁 𝗻𝗼𝘄 𝘄𝗶𝘁𝗵 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗶𝗻 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽!)
    // ⁡⁢⁢⁢$match: { _id: { $ne: 'EASY' } },⁡
    // ⁡⁢⁢⁢},⁡
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'Jon',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Aggregation Pipeline
exports.getToursWithYear = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const results = await Tour.aggregate([
    // in each tour we have an array that show when a tour starts I want first shows each items in a separate object of complete tour object
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // ⁡⁢⁢⁢$group : {⁡
      //   ⁡⁢⁢⁢_id : "$name",⁡
      //  ⁡⁢⁢⁢tourNumber : { $sum : 1},⁡
      //   ⁡⁢⁢⁢months : { $push : { $month : "$startDates" } }⁡
      // ⁡⁢⁢⁢}⁡
      $group: {
        _id: { $month: '$startDates' },
        tourNumber: { $sum: 1 },
        names: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: { $arrayElemAt: [[...months], { $subtract: ['$_id', 1] }] },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});

/// /tours-within/400/center/34.0206084,-118.0820743/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return new AppError('lat and lng is required', 400);
  }

  /// === number 6 ===
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return new AppError('lat and lng is required', 400);
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  /// === number 8 ===
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
