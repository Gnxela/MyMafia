var api = {
	HANDSHAKE: {action: "handshake", data: {username: "", session: ""}},
	WELCOME: {action: "welcome", data: {}},
	GET_MAP: {action: "getMap", data: {}}
};

api.on = function(socket, action, callback) {
	if (!action) {
		throw "Action is not defined.";
	}
	socket.on(action.action, callback);
}

api.emit = async function(socket, action, data, callback) {
	if (!socket || !socket.emit) {
		throw "Socket not defined/incorrect.";
	}
	if (!action) {
		throw "Action not defined.";
	}
	for (let key in action.data) {
		if (typeof action.data[key] != typeof data[key]) {
			throw "Data incorect for " + key + ". Expected: "  + typeof action.data[key] + ". Got: " + typeof data[key] + ". Index: " + i + ". Value: " + data[key];
		}
	}
	socket.emit(action.action, data, callback);
}

api.emitSync = async function(socket, action, data) {
	let xyz;
	let promise = new Promise((resolve, reject) => {
		api.emit(socket, action, data, (callbackData) => {
			xyz = callbackData;
			resolve();
		});
	})
	await promise;
	return xyz;
}

try {
	var exports = module.exports = api;
} catch (e) {}
