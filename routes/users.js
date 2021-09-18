const express = require('express');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

const router = express.Router();

router.route('/register').get(users.renderRegister).post(catchAsync(users.register));

router.route('/login')
        .get(users.renderLogIn)
        .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.logIn);

router.get('/logout', users.logOut);

module.exports = router;
