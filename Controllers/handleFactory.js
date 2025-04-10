/// IF you see to the controllers codes you can see that some basic of some functions are exactly the same so we can handle some of those in one central place

const APIFeatures = require('../utilities/apiFeatures');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    /// require for nested routes for get reviews related to a tour
    let filters = {};
    if (req.params.tourId) filters = { tour: req.params.tourId };

    let query = Model.find(filters);
    if (populateOptions) query = query.populate(populateOptions);
    const features = new APIFeatures(req.query, query);
    features.Filter().Sort().FieldLimit().Pagination();
    /// if we use .explain() here we get some information
    // const docs = await features.queryData.explain();
    /// .explain() is a method that provides execution stats for a query.

    /// What Are Execution Stats in MongoDB?
    /// Execution stats provide detailed information about how MongoDB executes a query, including:
    /// How the query was processed (e.g., index used, documents scanned).
    /// Performance metrics (e.g., execution time, memory usage).
    /// Query optimization details (e.g., whether an index was effective).

    /// here you can see that filtering data can be a expensive operation why?
    // "nReturned": 3,
    // "totalDocsExamined": 9 (nine is the number of doc we have)
    /// 3 docs find and return for us but 9 (all our docs) doc examined to find that three data
    /// in heavy collections this can be a expensive operation for performance   

    /// What is the solution for that? THE INDEXES
    /// Where can we write the index we need? in model
    // const docs = await features.queryData.explain();
    const docs = await features.queryData;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        docs,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const item = await query;

    if (!item) {
      return next(new AppError('item is not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        item,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const item = await Model.findByIdAndDelete(req.params.id);

    if (!item) {
      return next(new AppError('item is not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: {
        item: null,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return next(new AppError('item is not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        value: item,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newCreated = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        created: newCreated,
      },
    });
  });
