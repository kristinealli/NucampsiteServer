const cors = require("cors");

const whitelist = ["http://localhost:3000", "https://localhost:3443"];

const corsOptionsDelegate = (req, callback) => {
	let corsOptions;
	console.log(req.header("Origin"));
	if (whitelist.indexOf(req.header("Origin")) !== -1) { 
		corsOptions = { origin: true };
	} else {
		corsOptions = { origin: false };
	}
	callback(null, corsOptions);
};

exports.cors = cors(); //returns middleware response with a wildcard as its value - it allows cors for all origins
exports.corsWithOptions = cors(corsOptionsDelegate); // returns middleware response with a function as its value - it allows cors for a specific origin
