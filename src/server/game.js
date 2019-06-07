var Frame = require("./frame.js");

function Game(id, name, maxPlayers, passwd) {
	var password = passwd;
	var room = "game-" + id;

	this.id = id;
	this.name = name;
	this.maxPlayers = maxPlayers;
	this.hasPassword = password !== "";
	this.users = [];
	this.inProgress = false;
	this.frames = [];

	frames.push(new Frame("Pre-game"));

	this.registerSocket = function(user, socket) {
		if (this.users.includes(user)) {
			return;
		}
		this.users.push(user);
		socket.join(room);
		console.log(user.username + " joined <game " + id + ">")
	}

	this.getCurrentFrame = function() {
		return this.frames[this.frames.length - 1];
	}

	this.startGame = function() {
		if (inProgress) {
			return;
		}
		inProgress = true;
		frames.push(new Frame("Night 0"));
		api.emit(server.roomSocket(room), api.calls.NEW_FRAME, {frames: frames});
	}

	this.checkPassword = function(passwd) {
		return password === passwd;
	}
}

exports = module.exports = Game;
