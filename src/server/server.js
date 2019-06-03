var map = require("./map.js")
var api = require("./../api.js");
var users = require("./users.js");
var lobby = require("./lobby.js");
var server = {};

var exports = module.exports = server;

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

server.registerSocket =  function (socket) {
	socket.join("lobby");
	api.emit(socket, api.WELCOME, {games: lobby.games});
}

function loadMap() {
	map.width = map.height = 100;
	for (let x = 0; x < map.width; x++) {
		for (let y = 0; y < map.height; y++) {
			map.setTile(x, y, {x: x, y: y, color: "#FF0000"});
		}
	}
}

function init() {
	loadMap();
}

init();
