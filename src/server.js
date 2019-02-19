var map = {width: 0, height: 0, tiles: []};

var exports = module.exports = {
	registerSocket: function (socket) {
		socket.join("all");
		socket.on("getMap", map.getMap);
		socket.emit("welcome");
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

map.getMap = function(data, callback) {
	callback({width: map.width, height: map.height, tiles: map.tiles});
}


map.getTile = function(x, y) {
	if (map.tiles[x] && map.tiles[x][y]) {
		return map.tiles[x][y];
	}
}


map.setTile = function(x, y, tile) {
	if (!map.tiles[x]) {
		map.tiles[x] = [];
	}
	map.tiles[x][y] = tile;
}

function init() {
	loadMap();
}

init();
