var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var httpHandler = {};

function HTTPHandler(app, http) {

		//Allow post parameters in Express 4.15.
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	//Allow cookie parsing.
	app.use(cookieParser());

	app.get('/', function(req, res) {
		if (server.isLoggedIn(req.cookies.username, req.cookies.session)) {
			res.send("<a href=\"/game\">Play</a> | <a href=\"/logout\">Logout</a>");
		} else {
			res.send("<a href=\"/login\">Login</a> | <a href=\"/register\">Register</a>");
		}
	});

	app.get('/game', function(req, res) {
			if (server.isLoggedIn(req.cookies.username, req.cookies.session)) {
			res.sendFile(rootDir + "/data/pages/game.html");
		} else {
			res.redirect("/");
		}
	});

	app.get('/login', function(req, res) {
		res.sendFile(rootDir + "/data/pages/login.html");
	});

	app.post('/login', function(req, res) {
		if (req.body.username != "" && req.body.password != "") {
			let session = server.login(req.body.username, req.body.password);
			if (session) {
				res.redirect("/loginSuccess?username=" + req.body.username + "&session=" + session);
			} else {
				res.send("Username or password incorrect.");
			}
		} else {
			res.send("Invalid input.");
		}
	});

	app.get('/register', function(req, res) {
		res.sendFile(rootDir + "/data/pages/register.html");
	});

	app.post('/register', function(req, res) {
		if (req.body.username != "" && req.body.password != "") {
			if (server.register(req.body.username, req.body.password)) {
				res.send("Successfully registered.<br><a href=\"/login\">Login.</a>");
			} else {
				res.send("Username already registered. Pick another username.");
			}
		} else {
			res.send("Invalid input.");
		}
	});

	app.get('/loginSuccess', function(req, res) {
		res.sendFile(rootDir + "/data/pages/loginSuccess.html");
	});

	app.get('/logout', function(req, res) {
		res.sendFile(rootDir + "/data/pages/logout.html");
	});

	app.get('/loadResource/:resource', function(req, res) {
		let resource = req.params.resource;
		switch (resource) {
		case "game.js":
			let bundledScript = "";
			fs.readdirSync(rootDir + "/src/client/").forEach(file => {
				bundledScript += loadFile(rootDir + "/src/client/"  + file);
			});
			res.send(bundledScript);
			break;
		default:
			res.send("INVALID RESOURCE.");
			break;
		}
	});

	http.listen(9999, function() {
		console.log("Listening on port 9999");
	});
}

var exports = module.exports = HTTPHandler;
