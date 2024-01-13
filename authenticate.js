const passport = require("passport"); 
const LocalStrategy = require("passport-local").Strategy; 
const User = require("./models/user"); 
const JwtStrategy = require("passport-jwt").Strategy; 
const ExtractJwt = require("passport-jwt").ExtractJwt; 
const jwt = require("jsonwebtoken"); 

const config = require("./config.js"); 

exports.local = passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

//create a token
exports.getToken = user  => {
	return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
}; 


const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); 
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use( 
    new JwtStrategy( 
        opts, 
        (jwt_payload, done) => { 
			console.log("JWT Payload:", jwt_payload);
			User.findOne({ _id: jwt_payload._id }, (err, user) => {
				if (err) {
					return done(err, false); //no user found
				} if (user) {
					return done(null, user); //user found
				} else {
					return done(null, false); //no user found
				}
			});
		}
    )
);

exports.verifyUser = passport.authenticate("jwt", { session: false });


/*
Import necessary modules and files: Passport, Passport's local strategy, the User model, Passport's JWT strategy, a JWT extractor, JSON Web Token, and a configuration file.

Set up Passport to use the local strategy with the User model's authenticate method. This is used for username/password authentication.

Serialize and deserialize the user. This is necessary for maintaining user state between requests when using sessions.

Define a function getToken that creates a JWT with the user's information, signed with a secret key, and expires in 1 hour.

Set up options for the JWT strategy. The token will be extracted from the Authorization header as a Bearer token, and the secret key from the configuration file will be used to verify the token.

Set up Passport to use the JWT strategy. When a request comes in with a JWT, Passport will extract the JWT from the Authorization header, verify it with the secret key, and then use the payload of the JWT to find the corresponding user in the database. If the user is found, the request is authenticated.

Export a function verifyUser that uses Passport's authenticate method with the JWT strategy. This function can be used as middleware in routes to protect them with JWT authentication. The { session: false } option means that Passport will not create a session, so the client must send the JWT with every request. 
*/