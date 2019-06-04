var api = {
	HANDSHAKE: {action: "HANDSHAKE", data: {}},
	WELCOME: {action: "WELCOME", data: {}},
	DISCONNECT: {action: "DISCONNECT", data: {reason: ""}},
	GET_GAMES: {action: "GET_GAMES", data: {games: {}}},
	CREATE_GAME: {action: "CREATE_GAME", data: {maxPlayers: 1, password: ""}},
	JOIN_GAME: {action: "JOIN_GAME", data: {gameID: "", password: ""}},
};

api.user = {username: "", session: ""};

api.middleware = [];

api.use = function(func) {
	api.middleware.push(func);
}

api.once = function(socket, apiCall, callback) {
	on(false, socket, apiCall, callback);
}
api.on = function(socket, apiCall, callback) {
	on(true, socket, apiCall, callback);
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
		throw new Error("Socket not defined/incorrect.");
	}
	if (!apiCall) {
		throw new Error("apiCall not defined.");
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

api.fail = function(err) {
	return {ok: false, err: err};
}

api.succ = function() {
	return {ok: true, err: null};
}

function on(func, socket, apiCall, callback) {
	if (!socket) {
		throw new Error( "socket is not defined.");
	}
	if (!apiCall) {
		throw new Error( "apiCall is not defined.");
	}
	if (!callback) {
		throw new Error( "callback is not defined.");
	}
	let call = function(data, ackCallback) {
		if (!runMiddleware(socket, data)) {
			console.log("Failed packet: " + apiCall.action + ":" + JSON.stringify(data));
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

function runMiddleware(socket, data) {
	for (let i = 0; i < api.middleware.length; i++) {
		if (!api.middleware[i] || !api.middleware[i](socket, data)) {
			return false;
		}
	}
	return true;
}

try {
	var exports = module.exports = api;
} catch (e) {}
