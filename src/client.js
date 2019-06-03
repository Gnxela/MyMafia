var socket = io();

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

preload();
