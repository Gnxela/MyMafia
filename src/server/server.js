var map = require("./map.js")
var api = require("./../api.js");
var lobby = require("./lobby.js");
var server = {};

var exports = module.exports = function(users) {
	server.users = users;
	return server;
}

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
