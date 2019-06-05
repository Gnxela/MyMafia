var socket;
var api;
var username;

async function joinGame(id, password) {
	if (!password) {
		password = "";
	}
	let data = await api.emitSync(socket, api.calls.JOIN_GAME, {id: id, password: password});
	if (!data.ok) {
		error("Failed to create game: " + data.err);
		return false;
	}
	openPage("game");
}

async function createGame() {
	let data = await api.emitSync(socket, api.calls.CREATE_GAME, {maxPlayers: 3, password: "test"});
	if (data.ok === false) {
		error("Failed to create game: " + data.err);
		return false;
	}
	log("", data);
	return true;
}

async function getGames() {
	return await api.emitSync(socket, api.calls.GET_GAMES, {});
}

function init(games) {
	console.log(games);
	for (let i = 0; i < games.length; i++) {
		let game = games[i];
		for (let j = 0; j < game.users.length; j++) {
			if (game.users[j].username == username) {
				openPage('game')
				return;
			}
		}
	}
	openPage("lobby");
}

function preload() {
	setupSocket();
	handshake();
}

function setupSocket() {
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
		init(data.games);
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
		console.error(str + JSON.stringify(obj));
	} else {
		console.error(str);
	}
}

window.onload = function() {
	socket = io();
	preload();
	container = document.getElementById("container"); //ui.js
}
