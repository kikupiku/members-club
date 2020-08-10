var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let passport = require('passport');
let flash = require('connect-flash');
let session = require('express-session');
let bcrypt = require('bcryptjs');

const LocalStrategy = require('passport-local').Strategy;
const dotenv = require('dotenv');
dotenv.config();
const MONGODB_URI = process.env.MONGO_URI;
let User = require('./models/user');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let compression = require('compression');
let helmet = require('helmet');

var app = express();

let mongoose = require('mongoose');
let mongoDB = MONGODB_URI;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

app.use(compression());
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, (username, password, done) => {
    User.findOne({ email: username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect email' });
      }

      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  app.use('/public', express.static(path.join(__dirname, 'public')));

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
