var sha = require('sha2');

var users = {users: [], online: {}};
var timeout = 10 * 1000;

function init() {
	let u = loadJSONFile(rootDir + "/data/users.json");
	if (u) {
		users.users = u;
	}
}
init();

users.getUser = function(username) {
	return online[username]
}

users.updateOnline = function(socket, username, session) {
	if (users.online[username]) {
		let user = users.online[username];
		user.lastUpdate = new Date().getTime();
		clearTimeout(users.timeoutID);
		user.timeoutID = setTimeout(() => {
			user.disconnect();//Create a user class that handles all this stuff.
		}, timeout);
	} else {
		users.online[username] = {username: username, session: session, socket: socket, lastUpdate: new Date().getTime()};
		console.log(username + " came online.");
	}
}

users.isLoggedIn = function(username, session) {
	for (let i = 0; i < users.users.length; i++) {
		let user = users.users[i];
		if (user.username == username && user.session == session) {
			return true;
		}
	}
	return false;
}

users.register = function(username, password) {
	for (let i = 0; i < users.users.length; i++) {
		let user = users.users[i];
		if (user.username == username) {
			return false;
		}
	}
	let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
	users.users.push({username: username, password: passwordHash});
	writeJSONFile(rootDir + "/data/users.json")
	return true;
}

users.login = function(username, password) {
	let passwordHash = sha.sha224(password + passwordSalt).toString('hex');
	for (let i = 0; i < users.users.length; i++) {
		let user = users.users[i];
		if (user.username == username && user.password == passwordHash) {
			user.session = generateUID();
			writeJSONFile(rootDir + "/data/users.json", users.users);
			return user.session;
		}
	}
	return "";
}

exports = module.exports = users;
