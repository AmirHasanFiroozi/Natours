const express = require('express');

const {
  updateMe,
  deleteMe,
  getAllUser,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
  //   checkID,
  //   checkBody
} = require('../Controllers/userControllers');

const {
  signup,
  login,
  logout,
  forgetPass,
  resetPass,
  updatePassword,
  protect,
  restrictTo,
} = require('../Controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgetpass', forgetPass);
router.patch('/resetpass/:token', resetPass);

/// Protect all routes after this middleware
router.use(protect);

router.get('/logout', logout);
router.route('/updatepassword').patch(updatePassword);
router.route('/me').get(getMe , getUser);

/// put the multer middleware that you build in the rout that you send uploaded data on it
router.route('/updateme').patch(uploadUserPhoto , resizeUserPhoto , updateMe);
router.route('/deleteme').delete(deleteMe);

router.use(restrictTo('admin'))

router
  .route('/')
  .get(getAllUser)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser);

module.exports = router;
