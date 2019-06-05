var users = require("./users.js");

var Lobby = require("./lobby.js");
var API = require("./api.js");

function Server(io) {
	var api = new API();
	var lobby = new Lobby(io, api);

	io.on('connection', (socket) => {
		api.once(socket, api.calls.HANDSHAKE, () => {
			this.registerSocket(socket);
			lobby.registerSocket(socket);
		});
	});

	this.init = function() {
		addMiddleware();
	}

	this.registerSocket =  function (socket) {
		api.emit(socket, api.calls.WELCOME, {games: lobby.games});
	}

	var addMiddleware = function() {
		api.use((socket, data) => {
			if (!users.isLoggedIn(data.username, data.session)) {
				api.emit(socket, api.calls.DISCONNECT, {reason: "Invalid session."});
				console.log("Disconnected " + data.session + " for invalid session.");
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

	this.init();
}


var exports = module.exports = Server;
