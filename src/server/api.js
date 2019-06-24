function API() {
	var middleware = [];

	/**
	 * API calls. Data is the data the server expects to receive from the client.
	 */
	this.calls = {
		//System
		HEARTBEAT: {action: "HEARTBEAT", data: {}},
		GET_PATHS: {action: "GET_PATHS", data: {}},
		HANDSHAKE: {action: "HANDSHAKE", data: {}},
		DISCONNECT: {action: "DISCONNECT", data: {reason: ""}},
		//Lobby
		WELCOME: {action: "WELCOME", data: {}},
		GET_GAMES: {action: "GET_GAMES", data: {}},
		CREATE_GAME: {action: "CREATE_GAME", data: {name: "", maxPlayers: 1, password: ""}},
		JOIN_GAME: {action: "JOIN_GAME", data: {id: "", password: ""}},
		//Game
		GET_GAME: {action: "GET_GAME", data: {}},
		START_GAME: {action: "START_GAME", data: {}},
		NEW_FRAME: {action: "NEW_FRAME", data: {}},
		UPDATE_FRAME: {action: "UPDATE_FRAME", data: {}},
		START_VOTE: {action: "START_VOTE", data: {}},
		END_VOTE: {action: "END_VOTE", data: {}},
	};

	this.use = function(func) {
		middleware.push(func);
	}

	this.once = function(socket, apiCall, callback) {
		on(false, socket, apiCall, callback);
	}

	this.on = function(socket, apiCall, callback) {
		on(true, socket, apiCall, callback);
	}

	this.off = function(socket, apiCall) {
		socket.removeAllListeners(apiCall.action);
	}

	this.emit = function(socket, apiCall, data, callback) {
		if (!socket || !socket.emit) {
			throw new Error("Socket not defined/incorrect.");
		}
		if (!apiCall) {
			throw new Error("apiCall not defined.");
		}
		socket.emit(apiCall.action, {action: apiCall.action, data: data}, (callbackData) => {
			let err = verifyData(apiCall, data);
			if (err) {// We don't know the user (and no point searching for them).
				api.emit(socket, api.calls.DISCONNECT, {reason: err});
				log("Disconnected " + socket.handshake.address + ". Reason: " + err);
				socket.disconnect(true);
				callback(api.fail());
				return;
			}
			if (callback) {
				callback(callbackData);
			}
		});
	}

	this.emitSync = async function(socket, apiCall, data) {
		let xyz;
		let promise = new Promise((resolve, reject) => {
			this.emit(socket, apiCall, data, (callbackData) => {
				xyz = callbackData;
				resolve();
			});
		})
		await promise;
		return xyz;
	}

	this.emitRoom = function(room, apiCall, data) {
		server.roomSocket(room).emit(apiCall.action, {action: apiCall.action, data: data});
	}

	this.fail = function(err) {
		return {ok: false, err: err};
	}

	this.succ = function() {
		return {ok: true, err: ""};
	}

	function verifyData(apiCall, data) {
		let copiedData = JSON.parse(JSON.stringify(data));
		for (let key in apiCall.data) {
			if (typeof apiCall.data[key] != typeof data[key]) {
				return "Data incorect for " + apiCall.action + ":" + key + ". Expected: "  + typeof apiCall.data[key] + ". Got: " + typeof data[key] + ". Value: " + data[key];
			}
			delete copiedData[key];
		}
		for (let key in copiedData) {
			return "Unexpected data in " + apiCall.action + ":" + key + ". Value: " + copiedData[key];
		}
		return "";
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
			let err = verifyData(apiCall, data.data);
			if (err) {
				log(server.getUser(data.username).username + ": " + err);
				ackCallback({ok: false, err: err});
				return;
			}
			if (!runMiddleware(socket, data)) {
				log("Failed packet: " + apiCall.action + ":" + JSON.stringify(data));
				return;
			}
			callback(server.getUser(data.username), data.data, ackCallback);
		}
		if (func) {
			socket.on(apiCall.action, call);
		} else {
			socket.once(apiCall.action, call);
		}
	}

	function runMiddleware(socket, data) {
		for (let i = 0; i < middleware.length; i++) {
			if (!middleware[i] || !middleware[i](socket, data)) {
				return false;
			}
		}
		return true;
	}
}

var exports = module.exports = API;
