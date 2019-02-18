var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var io = require('socket.io')(http);
var sha = require('sha2');
var bodyParser = require('body-parser')

//Allow post parameters in Express 4.15.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

global.rootDir = path.resolve(__dirname + "/..");
global.passwordSalt = "gamesaltbvasd";

io.on('connection', function(socket) {
});

app.get('/', function(req, res) {
	res.send("<a href=\"/login\">Login</a>|<a href=\"/register\">Register</a>");
});

app.get('/game', function(req, res) {
	res.sendFile(rootDir + "/data/pages/game.html");
});

app.get('/login', function(req, res) {
	res.sendFile(rootDir + "/data/pages/login.html");
});

app.post('/login', function(req, res) {
	if (req.body.username != "" && req.body.password != "") {
		let users = JSON.parse(fs.readFileSync(rootDir + "/data/users.json"))
		if (!users) {
			res.send("Error reading users. Try again later.");
		}
		let passwordHash = sha.sha224(req.body.password + passwordSalt).toString('hex');
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			if (user.username == req.body.username && user.password == passwordHash) {
				let sessionID = sha.sha224(Math.random().toString()).toString('hex');
				user.session = sessionID;
				fs.writeFileSync(rootDir + "/data/users.json", JSON.stringify(users, null, 2));
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
		let users = JSON.parse(fs.readFileSync(rootDir + "/data/users.json"))
		if (!users) {
			res.send("Error reading users. Try again later.");
		}
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			if (user.username == req.body.username) {
				res.send("Username already registered. Pick another username.");
				return;
			}
		}
		let passwordHash = sha.sha224(req.body.password + passwordSalt).toString('hex');
		users.push({username: req.body.username, password: passwordHash});
		fs.writeFileSync(rootDir + "/data/users.json", JSON.stringify(users, null, 2));
		res.send("Successfully registered.<br><a href=\"/login\">Login.</a>");
	} else {
		res.send("Invalid input.");
	}
});

app.get('/loginSuccess', function(req, res) {
	res.sendFile(rootDir + "/data/pages/loginSuccess.html");
});

http.listen(9999, function() {
	console.log("Listening on port 9999");
});
