let Message = require('../models/message');
let User = require('../models/user');

let async = require('async');
const { body } = require('express-validator');

exports.message_create_get = function (req, res, next) {
  res.render('new-message', { title: 'Add New Message' });
};

exports.message_create_post = function (req, res, next) {
  res.send('NOT IMPLEMENTED YET: message create POST');
};

exports.message_delete_post = function (req, res, next) {
  res.send('NOT IMPLEMENTED YET: message delete POST');
};
