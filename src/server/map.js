var map = {width: 0, height: 0, tiles: []};

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

var exports = module.exports = map;
