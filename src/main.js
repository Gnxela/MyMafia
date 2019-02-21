var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//Allow post parameters in Express 4.15.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
//Allow cookie parsing.
app.use(cookieParser());

global.rootDir = path.resolve(__dirname + "/..");
global.passwordSalt = "gamesaltbvasd";
defineGlobals();

var users = require('./server/users.js');
var server = require('./server/server.js')(users);
var api = require('./api.js');
api.use((socket, data) => {
	if (!users.isLoggedIn(data.username, data.session)) {
		api.emit(socket, api.DISCONNECT, {reason: "Invalid session."});
		console.log("Disconnected " + data.session + " for invalid session.");
		socket.disconnect(true);
		return false;
	}
	let err = api.verifyData(api[data.action], data)
	if (err) {
		api.emit(socket, api.DISCONNECT, {reason: "Invalid data."});
		console.log("Disconnected " + data.session + " for invalid data.");
		socket.disconnect(true);
		return false;
	}
	return true;
});

io.on('connection', function(socket) {
	api.once(socket, api.HANDSHAKE, function(data) {
		server.registerSocket(socket);
	});
});

app.get('/', function(req, res) {
	if (users.isLoggedIn(req.cookies.username, req.cookies.session)) {
		res.send("<a href=\"/game\">Play</a> | <a href=\"/logout\">Logout</a>");
	} else {
		res.send("<a href=\"/login\">Login</a> | <a href=\"/register\">Register</a>");
	}
});

app.get('/game', function(req, res) {
	if (users.isLoggedIn(req.cookies.username, req.cookies.session)) {
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
		let session = users.login(req.body.username, req.body.password);
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
		if (users.register(req.body.username, req.body.password)) {
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
		res.send(loadFile(rootDir + "/src/api.js") + loadFile(rootDir + "/src/client.js"));
		break;
	default:
		res.send("INVALID RESOURCE.");
		break;
	}
});

function defineGlobals() {
	global.writeJSONFile = function(file, object) {
		return writeFile(file, JSON.stringify(object, null, 2))
	}

	global.writeFile = function(file, text) {
		fs.writeFileSync(file, text);
	}

	global.loadJSONFile = function(file) {
		return JSON.parse(loadFile(file))
	}

	global.loadFile = function(file) {
		return fs.readFileSync(file);
	}
}

http.listen(9999, function() {
	console.log("Listening on port 9999");
});
