let Message = require('../models/message');
let User = require('../models/user');

let async = require('async');
const { body, validationResult } = require('express-validator');
let passport = require('passport');
let bcrypt = require('bcryptjs');

exports.index = function (req, res, next) {
  Message.find({})
  .populate('author')
  .exec(function (err, messages) {
    if (err) {
      return next(err);
    }

    res.render('index', {
      title: '(Whisper campaign)',
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
  .withMessage('Please enter your first name')
  .isAlpha()
  .withMessage('The first name must be only alphabetical characters. Sorry, Elon Musk\'s daugther!')
  .escape(),

  body('lastName')
  .trim()
  .isLength({ min: 1 })
  .withMessage('You cannot leave your last name empty')
  .isAlpha()
  .withMessage('The last name must be alphabetical characters')
  .escape(),

  body('email')
  .trim()
  .isEmail()
  .withMessage('It has to be a real email address'),

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
  let errors = req.flash('error');
  res.render('log-in', { title: 'Sign In', errors: errors });
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

exports.level_up_get = function (req, res, next) {
  res.render('level-up', { title: 'Level Up' });
};

exports.level_up_post = [
  body('becomeMember')
  .trim()
  .escape(),

  (req, res, next) => {
    if (!req.user.isMember) {
      let user = new User({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        password: req.user.password,
        isAdmin: false,
        isMember: true,
        _id: req.user._id,
      });

      let memberPassword = process.env.MEMBER_LVL_UP;

      if (req.body.becomeMember === memberPassword) {
        User.findByIdAndUpdate(req.user._id, user, {}, function (err, upgradedUser) {
          if (err) {
            return next(err);
          }

          res.redirect('/');
        });
      } else {
        let unsuccessfulMsg = 'That is not the password. You will remain a regular user for now.';
        res.render('level-up', { title: 'Level Up', unsuccessfulMsg: unsuccessfulMsg });
      }
    } else if (req.user.isMember && !req.user.isAdmin) {
      let adminPassword = process.env.ADMIN_LVL_UP;

      let user = new User({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        password: req.user.password,
        isAdmin: true,
        isMember: true,
        _id: req.user._id,
      });

      if (req.body.becomeAdmin === adminPassword) {
        User.findByIdAndUpdate(req.user._id, user, {}, function (err, upgradedUser) {
          if (err) {
            return next(err);
          }

          res.redirect('/');
        });
      } else {
        let unsuccessfulMsg = 'That is not the password. You will remain a member without the right to delete messages for now.';
        res.render('level-up', { title: 'Level Up', unsuccessfulMsg: unsuccessfulMsg });
      }
    }
  },
];
