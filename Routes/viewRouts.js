const express = require('express');

const { getOverView , getTour , loginController , getMe } = require('../Controllers/viewController');
const { protect, loggedIn : isLoggedIn } = require('../Controllers/authController');

const router = express.Router();

router.get('/', isLoggedIn , getOverView);
router.get('/tour/:tourSlug', isLoggedIn , getTour);
router.get('/login', isLoggedIn ,loginController);
router.get('/me' , protect , getMe)

/// updating user data with base html form tag
/// we should specify special route here that name should be as the same of the name of action in the form that we specify that
// router.post('/submit-user-data' , protect , updateUserData);

module.exports = router;
