var api;

async function joinGame(id, password) {
	if (!password) {
		password = "";
	}
	let data = await api.emitSync(api.calls.JOIN_GAME, {id: id, password: password});
	if (!data.ok) {
		return false;
	}
	return true;
}

async function createGame(name, maxPlayers, password) {
	let data = await api.emitSync(api.calls.CREATE_GAME, {name: name, maxPlayers: maxPlayers, password: password});
	if (data.ok === false) {
		return false;
	}
	return true;
}

async function getGames() {
	try {
		return (await api.emitSync(api.calls.GET_GAMES, {})).games;
	} catch (e) {
		throw new Error(e);
	}
}

async function getGame() {
	try {
		return (await api.emitSync(api.calls.GET_GAME, {})).game;
	} catch (e) {
		throw new Error(e);
	}
}

async function init(games) {
	setInterval(() => {
		api.emit(api.calls.HEARTBEAT, {});
	}, 1000);
	//If we're in a game open the page.
	let data = await api.emitSync(api.calls.GET_PATHS, {});
	if (data.paths.includes("GET_GAME")) {
		openPage('game');
		return;
	}
	openPage("lobby");
}

function preload(socket) {
	setupSocket(socket);
	handshake();
}

function setupSocket(socket) {
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
	api = new API(socket, username, session);
	api.on(api.calls.DISCONNECT, (data) => {
		log("Server disconnected socket. Reason: " + data.reason);
		socket.disconnect(true);
	});
}

function handshake() {
	api.once(api.calls.WELCOME, (data) => {
		init(data.games);
	});
	api.emit(api.calls.HANDSHAKE, {});
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
	preload(socket);
	container = document.getElementById("container"); //ui.js
}
