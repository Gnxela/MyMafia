var Frame = require("./frame.js");

function Game(api, id, host, name, maxPlayers, passwd) {
	var password = passwd;
	var room = "game-" + id;

	this.id = id;
	this.host = host;
	this.name = name;
	this.maxPlayers = maxPlayers;
	this.hasPassword = password !== "";
	this.users = [];
	this.inProgress = false;
	this.isFinished = false;
	this.frames = [];

	this.init = function() {
		this.frames.push(new Frame("Pre-game"));
		this.getCurrentFrame().addAction("create_game", "%u created the game.", [host]);
	}

	this.registerSocket = function(user, socket) {
		api.on(socket, api.calls.GET_GAME, (user, data, ack) => {
			let game = this;
			if (game.users.includes(user)) {
				ack({game: game});
			}
			ack(api.fail("Invalid ID or not allowed (specify later)."));
		});

		socket.join(room);
		if (this.users.includes(user)) {
			log(user.username + " already in game.");
			return;
		}
		this.users.push(user);
		log(user.username + " joined <game " + id + ">");
	}

	this.getCurrentFrame = function() {
		return this.frames[this.frames.length - 1];
	}

	this.startGame = function() {
		if (inProgress) {
			return;
		}
		inProgress = true;
		this.frames.push(new Frame("Night 0"));
		api.emit(server.roomSocket(room), api.calls.NEW_FRAME, {frames: this.frames});
	}

	this.checkPassword = function(passwd) {
		return password === passwd;
	}

	this.init();
}

exports = module.exports = Game;
