var sha = require('sha2');

const TIMEOUT = 10 * 1000;

function User(username, _password, _session) {
	var session = _session;
	var password = _password;

	this.username = username;
	this.lastSeen;

	this.updateLastSeen = function() {
		this.lastSeen = new Date().getTime();
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

	this.setSession = function(_session) {
		session = _session;
	}

	this.transform = function() {
		return {username: this.username, password: password, session: session};
	}

	this.getPassword = function() {
		return password;
	}

	this.getSession = function() {
		return session;
	}
}


exports = module.exports = User;
