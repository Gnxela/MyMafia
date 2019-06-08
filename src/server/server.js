var sha = require("sha2");

var Lobby = require("./lobby.js");
var User = require("./user.js");
var API = require("./api.js");

function Server(http) {
	var io = require('socket.io')(http);

	var api = new API();
	var lobby = new Lobby(api);
	var users = {};//Username -> User

	io.on('connection', (socket) => {
		api.once(socket, api.calls.HANDSHAKE, (user) => {
			this.registerSocket(user, socket);
		});
	});

	this.init = function() {
		loadUsers();
		this.saveUsers();
		addMiddleware();
	}

	this.getUser = function(username) {
		return users[username];
	}

	this.registerSocket =  function (user, socket) {
		api.on(socket, api.calls.HEARTBEAT, () => {});
		api.on(socket, api.calls.GET_PATHS, () => {});
		lobby.registerSocket(user, socket);
		api.emit(socket, api.calls.WELCOME, {games: lobby.games});
	}

	this.register = function(username, password) {
		if (this.getUser(username)) {
			return false;
		}
		let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
		users[username] = new User(username, passwordHash, generateUID());
		this.saveUsers();
		return true;
	}

	this.login = function(username, password) {
		let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
		let user = this.getUser(username);
		if (!user) {
			return "";
		}
		if (user.username === username && user.getPassword() === passwordHash) {
			user.setSession(generateUID())
			this.saveUsers();
			return user.getSession();;
		}
		return "";
	}

	this.isLoggedIn = function(username, session) {
		if (this.getUser(username)) {
			return this.getUser(username).isLoggedIn(session);
		}
		return false;
	}

	this.roomSocket = function(room) {
		return io.to(room);
	}

	var addMiddleware = function() {
		api.use((socket, data) => {
			let user = users[data.username];
			if (!user) { //We don't know the user :(
				api.emit(socket, api.calls.DISCONNECT, {reason: "Invalid session."});
				console.log("Disconnected " + data.username + " for invalid session. Username did not exist.");
				socket.disconnect(true);
				return false;
			}
			if (!user.isLoggedIn(data.session)) {
				user.disconnect();
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
			users[user.username] = new User(user.username, user.password, user.session, user.lastSeen);
		}
	}

	this.saveUsers = function() {
		let usersArray = [];
		for (let username in users) {
			usersArray.push(this.getUser(username).transform());
		}
		writeJSONFile(global.rootDir + "/data/users.json", usersArray);
	}

	this.init();
}

var exports = module.exports = Server;
