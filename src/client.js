var socket = io();

async function createGame(maxPlayers, password) {
	let data = await api.emit(socket, api.CREATE_GAME, {maxPlayers, password});
	if (!data.ok) {
		error("Failed to create game: " + data.err);
		return false;
	}
	log("", data);
	return true;
}

async function getGames() {
	let games = await api.emit(socket, api.GET_GAMES, {});
	log(games);
	return games;
}

function init(games) {
	console.log(games);
}

function preload() {
	setupSocket();
	handshake();
}

function setupSocket() {
	api.on(socket, api.DISCONNECT, (data) => {
		console.log("Server disconnected socket. Reason: " + data.reason);
		socket.disconnect(true);
	});
}

function handshake() {
	let cookies = document.cookie.split("; ");
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].startsWith("username=")) {
			api.user.username = cookies[i].substring(9);
		}
		if (cookies[i].startsWith("session=")) {
			api.user.session = cookies[i].substring(8);
		}
	}
	api.once(socket, api.WELCOME, (data) => {
		init(data.games);
	});
	api.emit(socket, api.HANDSHAKE, {});
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

preload();
