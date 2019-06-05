var socket;
var api;

async function createGame() {
	let data = await api.emitSync(socket, api.calls.CREATE_GAME, {maxPlayers: 3, password: "test"});
	if (!data.ok) {
		error("Failed to create game: " + data.err);
		return false;
	}
	log("", data);
	return true;
}

async function getGames() {
	let games = await api.emitSync(socket, api.calls.GET_GAMES, {});
	log(games);
	return games;
}

function init() {
	document.getElementById("getGames").addEventListener("click", () => getGames());
	document.getElementById("createGame").addEventListener("click", () => createGame(3, "test"));
}

function preload() {
	setupSocket();
	handshake();
}

function setupSocket() {
	let username = "";
	let session = "";
	let cookies = document.cookie.split("; ");
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].startsWith("username=")) {
			username = cookies[i].substring(9);
		}
		if (cookies[i].startsWith("session=")) {
			session = cookies[i].substring(8);
		}
	}
	api = new API(username, session);
	api.on(socket, api.calls.DISCONNECT, (data) => {
		console.log("Server disconnected socket. Reason: " + data.reason);
		socket.disconnect(true);
	});
}

function handshake() {
	api.once(socket, api.calls.WELCOME, (data) => {
		init();
	});
	api.emit(socket, api.calls.HANDSHAKE, {});
}

function log(str, obj) {
	if (obj) {
		console.log(str + JSON.stringify(obj));
	} else {
		console.log(str);
	}
}

function error(str, obj) {
	if (obj) {
		console.err(str + JSON.stringify(obj));
	} else {
		console.err(str);
	}
}

window.onload = function() {
	socket = io();
	preload();
}
