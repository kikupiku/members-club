let Message = require('../models/message');
let User = require('../models/user');

let async = require('async');
const { body, validationResult } = require('express-validator');
let passport = require('passport');
let bcrypt = require('bcryptjs');

exports.index = function (req, res, next) {
  Message.find({})
  .exec(function (err, messages) {
    if (err) {
      return next(err);
    }

    res.render('index', {
      title: 'Insiders',
      messages: messages,
    });
    return;
  });
};

exports.user_create_get = function (req, res, next) {
  res.render('sign-up', { title: 'Sign Up' });
};

exports.user_create_post = [
  body('firstName')
  .trim()
  .isLength({ min: 1 })
  .withMessage('You cannot leave this field empty')
  .isAlpha()
  .withMessage('The first name must be only alphabetical characters. Sorry, Elon Musk\'s daugther!')
  .escape(),

  body('lastName')
  .trim()
  .isLength({ min: 1 })
  .withMessage('You cannot leave this field empty')
  .isAlpha()
  .withMessage('The last name must be alphabetical characters')
  .escape(),

  body('email')
  .trim()
  .isEmail()
  .withMessage('It has to be a real email address')
  .escape(),

  body('password')
  .trim()
  .isLength({ min: 5 })
  .withMessage('Your password needs to be at least 5 characters long'),

  (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const errors = validationResult(req);

      let user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        isAdmin: false,
        isMember: false,
      });

      if (!errors.isEmpty()) {
        res.render('sign-up', {
          title: 'Sign Up',
          errors: errors.array(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
        });
        return;
      } else {
        if (req.body.passwordConfirm === req.body.password) {
          user.save(err => {
            if (err) {
              return next(err);
            }

            res.redirect('/');
          });
        } else {
          let passwordConfirmFail = 'make sure the password matches the confirmation';
          res.render('sign-up', {
            title: 'Sign Up',
            passwordConfirmFail: passwordConfirmFail,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
          });
          return;
        }
      }
    });
  },
];

exports.user_log_in_get = function (req, res, next) {
  res.render('log-in', { title: 'Sign In', user: '' });
};

exports.user_log_in_post = [
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureFlash: true,
  }),
];

exports.user_log_out_get = function (req, res, next) {
  req.logout();
  res.redirect('/');
};

exports.membership_get = function (req, res, next) {
  res.send('NOT IMPLEMENTED YET: membership GET');
};

exports.membership_post = function (req, res, next) {
  res.send('NOT IMPLEMENTED YET: membership POST');
};
