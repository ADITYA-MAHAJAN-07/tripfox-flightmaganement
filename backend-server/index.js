var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const { getFlights } = require('./flightservice');
const Flight = require('./flights'); // Import the Flight model
const Booking = require('./booking'); // Import the Booking model

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/booking', async function(req, res, next) {
  try {
    // Call the getFlights function to retrieve flights from AviationStack
   // const flights = await getFlights();

    // Render the 'booking' view with the retrieved flights
    res.render('booking'/*,{ flights: flights }*/);
  } catch (error) {
    next(error);
  }
});



router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname,
  });
  userModel
    .register(data, req.body.password)
    .then(function() {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/profile');
      });
    })
    .catch(function(err) {
      console.error('Registration error:', err);
      res.redirect('/register'); // Redirect to the registration page on error
    });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).exec();
    res.render('profile', { user: user });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    successRedirect: '/profile',
  }),
  function(req, res, next) {
    // Authentication successful
  }
);

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/profile');
}

module.exports = router;
