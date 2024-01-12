var createError = require("http-errors"); //built-in error handler
var express = require("express"); //express framework
var path = require("path"); //built-in node module
//var cookieParser = require("cookie-parser");
var logger = require("morgan"); //HTTP request logger middleware

var indexRouter = require("./routes/index"); //index.js in routes folder
var usersRouter = require("./routes/users"); //users.js in routes folder
const campsiteRouter = require("./routes/campsiteRouter"); //campsiteRouter.js in routes folder
const promotionRouter = require("./routes/promotionRouter"); //promotionRouter.js in routes folder
const partnerRouter = require("./routes/partnerRouter"); //partnerRouter.js in routes folder

const session = require("express-session"); //express-session middleware
const passport = require("passport"); //passport authentication middleware
const authenticate = require("./authenticate"); //authenticate.js in routes folder
const FileStore = require("session-file-store")(session); //session-file-store middleware
const mongoose = require("mongoose"); //mongoose ODM
const url = "mongodb://localhost:27017/nucampsite"; //mongodb connection string

//Connect to mongodb server
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

// view engine setup
app.set("views", path.join(__dirname, "views")); //set views directory
app.set("view engine", "pug"); //set view engine to pug

//app.use(express.json()); //use express.json middleware
app.use(logger("dev")); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
//app.use(cookieParser("12345-67890-09876-54321"));

// Session Middleware
app.use(
	session({
		name: "session-id",
		secret: "12345-67890-09876-54321",
		saveUninitialized: false, //if no session info is saved, don't save a cookie
		resave: false, //if no changes to session, don't save a cookie
		store: new FileStore(), //store session info in a file
	})
); //use session middleware

// Passport Middleware - must be after session middleware - passport needs to know about the session
app.use(passport.initialize()); //initialize passport
app.use(passport.session()); //use passport session

app.use("/", indexRouter); //use indexRouter middleware
app.use("/users", usersRouter); //use usersRouter middleware

// Authentication Middleware
function auth(req, res, next) { 
	console.log(req.user);
	if (!req.user) {
		const err = new Error("You are not authenticated!");
		err.status = 401;
		return next(err);
	} else {
		return next();
	}
} 

app.use(auth);
app.use(express.static(path.join(__dirname, "public"))); 
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message; 
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app; 
