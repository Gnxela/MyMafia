function API(username, session) {
	var middleware = [];

	this.calls = { //API calls RECEIVED by the client.
		HANDSHAKE: {action: "HANDSHAKE", data: {}},
		WELCOME: {action: "WELCOME", data: {games: []}},
		DISCONNECT: {action: "DISCONNECT", data: {reason: ""}},
		GET_GAMES: {action: "GET_GAMES", data: {}},
		CREATE_GAME: {action: "CREATE_GAME", data: {}},
		JOIN_GAME: {action: "JOIN_GAME", data: {}},
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

	this.emit = async function(socket, apiCall, data, callback) {
		if (!socket || !socket.emit) {
			throw new Error("Socket not defined/incorrect.");
		}
		if (!apiCall) {
			throw new Error("apiCall not defined.");
		}
		let err = verifyData(apiCall, data);
		if (err) {
			throw err;
		}
		socket.emit(apiCall.action, {action: apiCall.action, username: username, session: session, data: data}, (callbackData) => {
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

	this.fail = function(err) {
		return {ok: false, err: err};
	}

	this.succ = function() {
		return {ok: true, err: null};
	}

	function verifyData(apiCall, data) {
		for (let key in apiCall.data) {
			if (typeof apiCall.data[key] != typeof data[key]) {
				return "Data incorect for " + apiCall.action + ":" + key + ". Expected: "  + typeof apiCall.data[key] + ". Got: " + typeof data[key] + ". Value: " + data[key];
			}
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
				console.log(err);
			}
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
		for (let i = 0; i < middleware.length; i++) {
			if (!middleware[i] || !middleware[i](socket, data)) {
				return false;
			}
		}
		return true;
	}
}
