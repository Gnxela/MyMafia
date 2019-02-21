var sha = require('sha2');

var users = loadJSONFile(rootDir + "/data/users.json");

users.isLoggedIn = function(username, session) {
	for (let i = 0; i < users.length; i++) {
		let user = users[i];
		if (user.username == username && user.session == session) {
			return true;
		}
	}
	return false;
}

users.register = function(username, password) {
	for (let i = 0; i < users.length; i++) {
		let user = users[i];
		if (user.username == username) {
			return false;
		}
	}
	let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
	users.push({username: username, password: passwordHash});
	writeJSONFile(rootDir + "/data/users.json")
	return true;
}

users.login = function(username, password) {
	let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
	for (let i = 0; i < users.length; i++) {
		let user = users[i];
		if (user.username == username && user.password == passwordHash) {
			let sessionID = sha.sha224(Math.random().toString()).toString('hex');
			user.session = sessionID;
			writeJSONFile(rootDir + "/data/users.json", users);
			return sessionID;
		}
	}
	return "";
}

exports = module.exports = users;
