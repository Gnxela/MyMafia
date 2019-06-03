var users = require("./users.js");
var api = require("../api.js");

var Lobby = require("./lobby.js");

function Server(io) {
	var io = io;
	var lobby = new Lobby();

	this.init = function() {
		addMiddleware();
	}

	var addMiddleware = function() {
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

		api.use((socket, data) => {
			users.updateOnline(socket, data.username, data.session);
			return true;
		});
	}

	this.registerSocket =  function (socket) {
		socket.join("lobby");
		api.emit(socket, api.WELCOME, {games: lobby.games});
	}

	this.init();
}


var exports = module.exports = Server;
