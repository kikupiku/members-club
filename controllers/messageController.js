let Message = require('../models/message');
let User = require('../models/user');

let async = require('async');
const { body, validationResult } = require('express-validator');

exports.message_create_get = function (req, res, next) {
  res.render('new-message', { title: 'Add New Message' });
};

exports.message_create_post = [
  body('msgTitle')
  .trim()
  .isLength({ min: 1 })
  .withMessage('You cannot leave the title empty')
  .escape(),

  body('msgContent')
  .trim()
  .isLength({ min: 1 })
  .withMessage('If you want to post a message, write a message')
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    User.findOne({ 'email': req.body.msgAuthor })
    .exec(function (err, user) {
      if (err) {
        return next(err);
      }

      let message = new Message({
        title: req.body.msgTitle,
        content: req.body.msgContent,
        author: user,
        date: new Date(),
      });

      if (!errors.isEmpty()) {
        res.render('/new-message', {
          title: 'Add New Message',
          errors: errors.array(),
          msgTitle: req.body.msgTitle,
          msgContent: req.body.msgContent,
        });
        return;
      } else {
        message.save(err => {
          if (err) {
            return next(err);
          }

          res.redirect('/');
        });
      }
    });

  },
];

exports.message_delete_post = function (req, res, next) {
  res.send('NOT IMPLEMENTED YET: message delete POST');
};
