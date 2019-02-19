var map = require("./map.js")
var api = require("./../api.js");

var exports = module.exports = {
	registerSocket: function (socket) {
		socket.join("all");
		//api.on(socket, api.GET_MAP, map.getMap);
		api.emit(socket, api.WELCOME, {});
	}
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
