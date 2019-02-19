var socket = io();
var canvas;
var user = {};
var map = {width: 0, height: 0, tiles: [], camera: {x: 0, y: 0}};
var mouse = {down: false, x : 0, y : 0};

var TILE_WIDTH = 10;
var CHUNK_WIDTH = 30;

async function init() {
	await loadMap();
	canvas = document.getElementById("canvas");
	canvas.addEventListener("mousedown", mouseDown);
	canvas.addEventListener("mousemove", mouseMove);
	canvas.addEventListener("mouseup", mouseUp);
	canvas.addEventListener("mouseout", mouseUp);
	setInterval(render, 10);
}

async function render() {
	let ctx = canvas.getContext("2d");

	let width = canvas.width;
	let height = canvas.height;
	let originX = Math.floor(map.camera.x / TILE_WIDTH);
	let originY = Math.floor(map.camera.y / TILE_WIDTH);
	let offsetX = map.camera.x - originX * TILE_WIDTH;
	let offsetY = map.camera.y - originY * TILE_WIDTH;

	let mouseTile = pointToTile(map.camera.x + mouse.x, map.camera.y + mouse.y);

	ctx.clearRect(0, 0, width, height);
	for (let x = 0; x < Math.floor(width / TILE_WIDTH) + 1; x++) {
		for (let y = 0; y < Math.floor(height / TILE_WIDTH) + 1; y++) {
			let realX = originX + x;
			let realY = originY + y;
			let tile = map.getTile(realX, realY);
			if (tile) {
				ctx.fillStyle = tile.color;
				ctx.fillRect(x * TILE_WIDTH - offsetX, y * TILE_WIDTH - offsetY, TILE_WIDTH, TILE_WIDTH);
				if (mouseTile && mouseTile.x == tile.x && mouseTile.y == tile.y) {
					ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
					ctx.fillRect(x * TILE_WIDTH - offsetX, y * TILE_WIDTH - offsetY, TILE_WIDTH, TILE_WIDTH);
				}
			}
		}
	}
}

async function loadMap() {
	await socket.emit("getMap", {}, (data) => {
		map.width = data.width;
		map.height = data.height;
		map.tiles = data.tiles;
	});
}

function pointToTile(x, y) {
	return map.getTile(Math.floor(x / TILE_WIDTH), Math.floor(y / TILE_WIDTH));
}

function mouseDown() {
	mouse.down = true;
}

function mouseMove(e) {
	let dx = mouse.x - e.pageX;
	let dy = mouse.y - e.pageY;
	if (mouse.down) {
		map.camera.x += dx;
		map.camera.y += dy;
	}
	mouse.x = e.pageX;
	mouse.y = e.pageY;
}

function mouseUp() {
	mouse.down = false;
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

function preload() {
	//Load resources etc.
	handshake();
}

function handshake() {
	let cookies = document.cookie.split("; ");
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].startsWith("username=")) {
			user.username = cookies[i].substring(9);
		}
		if (cookies[i].startsWith("session=")) {
			user.session = cookies[i].substring(8);
		}
	}
	socket.once("welcome", () => {
		init();
	});
	socket.emit("handshake", user);
}

preload();
