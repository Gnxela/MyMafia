var sha = require('sha2');

const TIMEOUT = 3 * 1000;

function User(username, _password, _session, lastSeen) {
	var session = _session;
	var password = _password;
	var timeoutId = 0;

	this.username = username;
	this.lastSeen = lastSeen;
	if (!lastSeen) {
		this.lastSeen = 0;
	}

	this.updateLastSeen = function() {
		let timeNow = new Date().getTime();
		if (timeNow - this.lastSeen > TIMEOUT) {
			console.log(username + " came online.")
		}
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			console.log(username + " went offline.")
		}, TIMEOUT)
		this.lastSeen = timeNow
	}

	this.isLoggedIn = function(_session) {
		return session === _session;
	}

	this.login = function(rawPassword) {
		let passwordHash = sha.sha224(rawPassword + passwordSalt).toString('hex');
		if (password === _password) {
			session = global.generateUID();
		} else {
			return ""
		}
	}

	this.disconnect = function(socket, reason) {
		api.emit(socket, api.calls.DISCONNECT, {reason: reason});
		console.log("Disconnected " + this.username + ". Reason: " + reason);
		socket.disconnect(true);
	}

	this.setSession = function(_session) {
		session = _session;
	}

	this.transform = function() {
		return {username: this.username, password: password, session: session, lastSeen: this.lastSeen};
	}

	this.getPassword = function() {
		return password;
	}

	this.getSession = function() {
		return session;
	}
}


exports = module.exports = User;
