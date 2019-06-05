var Lobby = require("./lobby.js");
var User = require("./user.js");
var API = require("./api.js");

function Server(io) {
	var api = new API();
	var lobby = new Lobby(io, api);
	var users = {};//Username -> User

	io.on('connection', (socket) => {
		api.once(socket, api.calls.HANDSHAKE, () => {
			this.registerSocket(socket);
			lobby.registerSocket(socket);
		});
	});

	this.init = function() {
		loadUsers();
		addMiddleware();
	}

	this.registerSocket =  function (socket) {
		api.emit(socket, api.calls.WELCOME, {games: lobby.games});
	}

	this.register = function(username, password) {
		if (users[username]) {
			return false;
		}
		let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
		users[username] = new User(username, password, generateUID());
		writeUsers();
		return true;
	}

	this.login = function(username, password) {
		let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
		let user = users[username];
		if (user.username == username && user.getPassword() == passwordHash) {
			user.setSession(generateUID())
			writeUsers();
			return user.getSession();;
		}
		return "";
	}

	this.isLoggedIn = function(username, session) {
		if (users[username]) {
			return users[username].isLoggedIn(session);
		}
		return false;
	}

	var addMiddleware = function() {
		api.use((socket, data) => {
			let user = users[data.username];
			if (!user) {
				api.emit(socket, api.calls.DISCONNECT, {reason: "Invalid session."});
				console.log("Disconnected " + data.username + " for invalid session. Username did not exist.");
				socket.disconnect(true);
				return false;
			}
			if (!user.isLoggedIn(data.session)) {
				api.emit(socket, api.calls.DISCONNECT, {reason: "Invalid session."});
				console.log("Disconnected " + data.username + " for invalid session.");
				socket.disconnect(true);
				return false;
			}
			return true;
		});

		api.use((socket, data) => {
			users[data.username].updateLastSeen();
			return true;
		});
	}

	var loadUsers = function() {
		let usersFile = loadJSONFile(global.rootDir + "/data/users.json");
		for (let index = 0; index < usersFile.length; index++) {
			let user = usersFile[index];
			users[user.username] = new User(user.username, user.password, user.session);
		}
	}

	// Transforms User class mantually. Can't just write the object because of the private variables.
	global.writeUsers = function() {
		let usersArray = [];
		for (let username in users) {
			usersArray.push(users[username].transform());
		}
		writeJSONFile(global.rootDir + "/data/users.json", usersArray);
	}

	this.init();
}

var exports = module.exports = Server;
