function API(socket, username, session) {
	var middleware = [];

	this.calls = { //API calls RECEIVED by the client.
		//System
		HEARTBEAT: {action: "HEARTBEAT", data: {}},
		GET_PATHS: {action: "GET_PATHS", data: {paths: []}},
		HANDSHAKE: {action: "HANDSHAKE", data: {}},
		DISCONNECT: {action: "DISCONNECT", data: {reason: ""}},
		//Lobby
		WELCOME: {action: "WELCOME", data: {games: []}},
		GET_GAMES: {action: "GET_GAMES", data: {games: []}},
		CREATE_GAME: {action: "CREATE_GAME", data: {ok: true, err: ""}},
		JOIN_GAME: {action: "JOIN_GAME", data: {ok: true, err: ""}},
		//Game
		GET_GAME: {action: "GET_GAME", data: {game: {}}},
		START_GAME: {action: "START_GAME", data: {ok: true, err: ""}},
		NEW_FRAME: {action: "NEW_FRAME", data: {frame: {}}},
		UPDATE_FRAME: {action: "UPDATE_FRAME", data: {frame: {}}},
		START_VOTE: {action: "START_VOTE", data: {name: "", targets: []}},
		END_VOTE: {action: "END_VOTE", data: {}},
	};

	this.use = function(func) {
		middleware.push(func);
	}

	this.once = function(apiCall, callback) {
		on(false, apiCall, callback);
	}

	this.on = function(apiCall, callback) {
		on(true, apiCall, callback);
	}

	this.off = function(apiCall) {
		socket.removeAllListeners(apiCall.action);
	}

	this.emit = async function(apiCall, data, callback) {
		if (!socket || !socket.emit) {
			throw new Error("Socket not defined/incorrect.");
		}
		if (!apiCall) {
			throw new Error("apiCall not defined.");
		}
		socket.emit(apiCall.action, {action: apiCall.action, username: username, session: session, data: data}, (callbackData) => {
			let err = verifyData(apiCall, callbackData);
			if (err) {
				log("Data received: " + JSON.stringify(callbackData));
				throw new Error("emit() callback: " + err);
			}
			if (callback) {
				callback(callbackData);
			}
		});
	}

	this.emitSync = async function(apiCall, data) {
		let xyz;
		let promise = new Promise((resolve, reject) => {
			this.emit(apiCall, data, (callbackData) => {
				xyz = callbackData;
				resolve();
			});
		})
		await promise;
		return xyz;
	}

	this.fail = function(err) {
		return {ok: false, err: err};
	}

	this.succ = function() {
		return {ok: true, err: ""};
	}

	function verifyData(apiCall, data) {
		if (!data) {
			return "Data is undefined: " + data;
		}
		let copiedData = JSON.parse(JSON.stringify(data));
		for (let key in apiCall.data) {
			if (typeof apiCall.data[key] != typeof data[key]) {
				return "Data incorect for " + apiCall.action + ":" + key + ". Expected: "  + typeof apiCall.data[key] + ". Got: " + typeof data[key] + ". Value: " + data[key];
			}
			delete copiedData[key]
		}
		for (let key in copiedData) {
			return "Unexpected data in " + apiCall.action + ":" + key + ". Value: " + copiedData[key];
		}
		return "";
	}

	function on(func, apiCall, callback) {
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
			let err = verifyData(apiCall, data.data);
			if (err) {
				throw new Error("on(" + apiCall.action + "): " + err);
			}
			if (!runMiddleware(data)) {
				log("Failed packet: " + apiCall.action + ":" + JSON.stringify(data));
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

	function runMiddleware(data) {
		for (let i = 0; i < middleware.length; i++) {
			if (!middleware[i] || !middleware[i](socket, data)) {
				return false;
			}
		}
		return true;
	}
}
