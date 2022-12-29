require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var errorRouter = require('./routes/error');
var battlesApiRouter = require('./routes/api/battles.api');
var usersApiRouter = require('./routes/api/users.api');
var meetingApiRouter = require('./routes/api/meeting.api');
var scheduleApiRouter = require('./routes/api/schedule.api');
var attendApiRouter = require('./routes/api/attend.api');
var mapApiRouter = require('./routes/api/map.api');
var pictureApiRouter = require('./routes/api/picture.api');
var gameRouter = require('./routes/api/game.api');

var app = express();

const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./authentication/passport');
const flash = require('connect-flash');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 세션 활성화
app.use(session({ secret : process.env.PASSPORT_SECRET, resave: true, saveUninitialized: false}));
app.use(flash());
app.use(passport.initialize()); // Passport 구동
app.use(passport.session());    // 세션 적용
passportConfig();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(path.join(__dirname, 'node_modules')));

// console.log(`${process.env.DB_URI} ${process.env.DB_PORT} ${process.env.DB_USER} ${process.env.DB_PASSWORD} ${process.env.DB_NAME}`);

// 미들웨어
var passportMiddleWare = function (req, res, next) {
  // console.log(req.path);
  // console.log(req.session.passport.user);
  if (req.isAuthenticated()) {
    // var requestUri = req.path;
    // var isAdminPage = requestUri.startsWith('/admin/');
    // var isAdmin = req.session.passport.user.admin;
    // if ( isAdmin == undefined ) {
    //   isAdmin = false;
    // }
    // console.log('request admin page :', isAdminPage, ' is admin user :', isAdmin);
    // if ( isAdminPage && !isAdmin ) {
    //   req.logout();
    //   res.redirect('/login');
    //   return false;
    // }
    // console.log(req.session.passport.user);
    return next();
  }
  // console.log('Not isAuthenticated()');
  console.log('not authenticated.');
  res.redirect('/login');
}

app.use('/game', gameRouter);
app.use('/', loginRouter);
app.use('/error', errorRouter);
app.use('/users', usersApiRouter);
app.use(passportMiddleWare);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/battles', battlesApiRouter);
// app.use('/meets', meetingApiRouter);
app.use('/schedule', scheduleApiRouter);
app.use('/attend', attendApiRouter);
app.use('/map', mapApiRouter);
app.use('/picture', pictureApiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
