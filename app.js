var createError = require("http-errors"); //built-in error handler
var express = require("express"); //express framework
var path = require("path"); //built-in node module
var logger = require("morgan"); //HTTP request logger middleware
const passport = require("passport"); //passport authentication middleware
const config = require("./config.js"); //configuration module

var indexRouter = require("./routes/index"); //index.js in routes folder
var usersRouter = require("./routes/users"); //users.js in routes folder
const campsiteRouter = require("./routes/campsiteRouter"); //campsiteRouter.js in routes folder
const promotionRouter = require("./routes/promotionRouter"); //promotionRouter.js in routes folder
const partnerRouter = require("./routes/partnerRouter"); //partnerRouter.js in routes folder
const uploadRouter = require("./routes/uploadRouter"); //uploadRouter.js in routes folder

const mongoose = require("mongoose"); //mongoose ODM

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
	useCreateIndex: true,
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

//log connection status
connect.then(
	() => console.log("Connected correctly to server"),
	(err) => console.log(err)
);

//create express app
var app = express();

app.all('*', (req, res, next) => {
	if (req.secure) {
		return next();
	} else {
		console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
		res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
	}
}); // Catch all HTTP methods, uses * as a wildcard

// view engine setup
app.set("views", path.join(__dirname, "views")); //set views directory
app.set("view engine", "pug"); //set view engine to pug

//app.use(express.json()); //use express.json middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(express.static(path.join(__dirname, "public")));

app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);
app.use("/imageUpload", uploadRouter);

app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
