var api = {
	HANDSHAKE: {action: "HANDSHAKE", data: {}},
	WELCOME: {action: "WELCOME", data: {games: {}}},
	DISCONNECT: {action: "DISCONNECT", data: {reason: ""}},
	GET_GAMES: {action: "GET_GAMES", data: {}},
	CREATE_GAME: {action: "CREATE_GAME", data: {maxPlayers: 1, password: ""}},
	JOIN_GAME: {action: "JOIN_GAME", data: {gameID: "", password: ""}},
	GET_MAP: {action: "GET_MAP", data: {}}
};

api.user = {username: "", session: ""};

api._middleware = [];

api.use = function(func) {
	api._middleware.push(func);
}

api.once = function(socket, apiCall, callback) {
	_on(false, socket, apiCall, callback);
}
api.on = function(socket, apiCall, callback) {
	_on(true, socket, apiCall, callback);
}

api.verifyData = function(apiCall, data) {
	for (let key in apiCall.data) {
		if (typeof apiCall.data[key] != typeof data[key]) {
			return "Data incorect for " + key + ". Expected: "  + typeof apiCall.data[key] + ". Got: " + typeof data[key] + ". Value: " + data[key];
		}
	}
	return "";
}

api.emit = async function(socket, apiCall, data, callback) {
	if (!socket || !socket.emit) {
		throw "Socket not defined/incorrect.";
	}
	if (!apiCall) {
		throw "apiCall not defined.";
	}
	let err = api.verifyData(apiCall, data);
	if (err) {
		throw err;
	}
	socket.emit(apiCall.action, {action: apiCall.action, username: api.user.username, session: api.user.session, data: data}, (callbackData) => {
		if (callback) {
			callback(callbackData);
		}
	});
}

api.emitSync = async function(socket, apiCall, data) {
	let xyz;
	let promise = new Promise((resolve, reject) => {
		api.emit(socket, apiCall, data, (callbackData) => {
			xyz = callbackData;
			resolve();
		});
	})
	await promise;
	return xyz;
}

function _on(func, socket, apiCall, callback) {
	if (!socket) {
		throw "socket is not defined.";
	}
	if (!apiCall) {
		throw "apiCall is not defined.";
	}
	if (!callback) {
		throw "callback is not defined.";
	}
	let call = function(data, ackCallback) {
		if (!_runMiddleware(socket, data)) {
			console.log("Failed packet: " + apiCall.action + ":" + data);
			return;
		}
		callback(data.data, ackCallback);
	}
	if (func) {
		socket.on(apiCall.action, call);
	} else {
		socket.once(apiCall.action, call);
	}
}

function _runMiddleware(socket, data) {
	for (let i = 0; i < api._middleware.length; i++) {
		if (!api._middleware[i] || !api._middleware[i](socket, data)) {
			return false;
		}
	}
	return true;
}

try {
	var exports = module.exports = api;
} catch (e) {}
