const express = require("express")
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const app = express()
const path = require('path')
const mustacheExpress = require("mustache-express")
const VIEWS_PATH = path.join(__dirname, '/views')
const singlyRouter = require('./routes/singly')


const indexRouter = require('./routes');
const usersRouter = require('./routes/users');

app.engine("mustache", mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))

app.set("views", VIEWS_PATH)
app.set("view engine", "mustache")

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
// app.use("/css", express.static(__dirname + '/css'))
app.use('/', singlyRouter)
app.use(express.static(path.join(__dirname, 'public')))

//app.use('/', indexRouter);
app.use('/users', usersRouter);
const checkout = require('./routes/checkout');
app.use('/checkout', checkout);

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

app.listen(3000, () => {
    console.log("Hey the server is running...")
})

module.exports = app;