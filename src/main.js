var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var io = require('socket.io')(http);
var sha = require('sha2');
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

var users = loadJSONFile(rootDir + "/data/users.json");
var server = require('./server/server.js')(users);
var api = require('./api.js');
api.use((socket, data) => {
	if (!isLoggedIn(data.username, data.session)) {
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
	if (isLoggedIn(req.cookies.username, req.cookies.session)) {
		res.send("<a href=\"/game\">Play</a> | <a href=\"/logout\">Logout</a>");
	} else {
		res.send("<a href=\"/login\">Login</a> | <a href=\"/register\">Register</a>");
	}
});

app.get('/game', function(req, res) {
	if (isLoggedIn(req.cookies.username, req.cookies.session)) {
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
		let passwordHash = sha.sha224(req.body.password + passwordSalt).toString('hex');
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			if (user.username == req.body.username && user.password == passwordHash) {
				let sessionID = sha.sha224(Math.random().toString()).toString('hex');
				user.session = sessionID;
				writeJSONFile(rootDir + "/data/users.json", users);
				res.redirect("/loginSuccess?username=" + user.username + "&session=" + sessionID);
				return;
			}
		}
		res.send("Username or password incorrect.");
	} else {
		res.send("Invalid input.");
	}
});

app.get('/register', function(req, res) {
	res.sendFile(rootDir + "/data/pages/register.html");
});

app.post('/register', function(req, res) {
	if (req.body.username != "" && req.body.password != "") {
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			if (user.username == req.body.username) {
				res.send("Username already registered. Pick another username.");
				return;
			}
		}
		let passwordHash = sha.sha224(req.body.password + passwordSalt).toString('hex');
		users.push({username: req.body.username, password: passwordHash});
		writeJSONFile(rootDir + "/data/users.json")
		res.send("Successfully registered.<br><a href=\"/login\">Login.</a>");
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

function writeJSONFile(file, object) {
	return writeFile(file, JSON.stringify(object, null, 2))
}

function writeFile(file, text) {
	fs.writeFileSync(file, text);
}

function loadJSONFile(file) {
	return JSON.parse(loadFile(file))
}

function loadFile(file) {
	return fs.readFileSync(file);
}

function isLoggedIn(username, session) {
	for (let i = 0; i < users.length; i++) {
		let user = users[i];
		if (user.username == username && user.session == session) {
			return true;
		}
	}
	return false;
}

http.listen(9999, function() {
	console.log("Listening on port 9999");
});
