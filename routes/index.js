var express = require('express');
var router = express.Router();

let userController = require('../controllers/userController');
let messageController = require('../controllers/messageController');

/* GET home page. */
router.get('/', userController.index);

// USER ROUTES //
router.get('/sign-up', userController.user_create_get);
router.post('/sign-up', userController.user_create_post);
router.get('/log-in', userController.user_log_in_get);
router.post('/log-in', userController.user_log_in_post);
router.get('/log-out', userController.user_log_out_get);
router.get('/level-up', userController.level_up_get);
router.post('/level-up', userController.level_up_post);

// MESSAGE ROUTES //
router.get('/new-message', messageController.message_create_get);
router.post('/new-message', messageController.message_create_post);
router.post('/', messageController.message_delete_post);

router.use(function (err, req, res, next) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('404');
  }
});

module.exports = router;
