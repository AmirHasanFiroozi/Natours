/// HTTP GET method (GET is used to request data from a specified resource)
/// get all tours
// app.get('/api/v1/tours', getAllTour);

/// HTTP POST method (POST is used to send data to a server to create/update a resource)
// app.post('/api/v1/tours', createTour);

/// get a tour depend on id in the URL
// app.get('/api/v1/tours/:id', getTour);

/// HTTP PUT method (updates an instance of a resource by replacing the existing resource with the resource provided in the request body.)
/// when you want to update data with "PUT" you should send all the data for example :
/// actual data is { name : "something" , family : "something" , age : 15 }
/// when you send a request and you want to just update the age ,you should send all data with updated age
/// like this { name : "something" , family : "something" , age : 16 }
/// --------------------------------------------------------------------------
/// HTTP PATCH method (a request method in HTTP for making partial changes to an existing resource)
/// when you want to update data with "PATCH" you should send just updated data for example :
/// actual data is { name : "something" , family : "something" , age : 15 }
/// when you send a request and you want to just update the age ,you should send just new age
/// like this { age : 16 }
// app.patch('/api/v1/tours/:id', updateTour);

/// HTTP DELETE method (used to delete a resource on the server)
// app.delete('/api/v1/tours/:id', deleteTour);

const express = require('express');

const {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourState,
  getToursWithYear,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
  // checkID,
  // checkBody,
} = require('../Controllers/tourControllers');

const { protect, restrictTo } = require('../Controllers/authController');
const reviewRouter = require('./reviewRouts');

/// create router object from express
const router = express.Router();

/// we want to use review router for this specific route in tour route
/// this called merge different routes => merge route
router.use('/:tourId/reviews', reviewRouter);

/// special type of middleware we called params middleware that is run whenever we have a special type of params
// router.param("id" , checkID);

/// create route from router object and specify HTTP method chain
/// each of HTTP methods here is a middleware
/// look at .post we have tow entree they are specify as tow middleware in a row. we use this way for modify information
// router.route('/').get(getAllTour).post(checkBody, createTour);

/// Create special API for special reason
router.route('/top-5-cheeps').get(aliasTopTour, getAllTour);
router.route('/tour-stats').get(getTourState);
router.route('/year/:year').get(protect ,restrictTo("admin","lead-guide"),getToursWithYear);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

/// Imagine that we want to get all tours route be protected it means we want to just only users can visit it not everyone
router
  .route('/')
  .get(getAllTour)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

/// In some routes just a few roles can access to it for example everyone can't delete a tour just admin can do that so let's implement that here
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages , resizeTourImages , updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

/// we export router object that contain all our route and their HTTP methods to add in route middleware in the app
module.exports = router;
