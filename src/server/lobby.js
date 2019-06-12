var Game = require("./game.js")

function Lobby(api) {
	this.games = [];

	this.registerSocket = function(user, socket) {
		let currentGame = this.getCurrentGame(user)
		if (currentGame) {
			if (!currentGame.isFinished) {
				currentGame.registerSocket(user, socket);
				return;
			}
			this.removeGame(currentGame);
		}

		api.on(socket, api.calls.GET_GAMES, (user, data, ack) => {
			ack({games: this.games});
		});

		api.on(socket, api.calls.CREATE_GAME, (user, data, ack) => {
			this.createGame(user, data.name, data.maxPlayers, data.password);
			ack(api.succ());
		});

		api.on(socket, api.calls.JOIN_GAME, (user, data, ack) => {
			let game = this.getGame(data.id);
			if (!game) {
				ack(api.fail("Game with id '" + data.id + "' does not exist."));
				return;
			}
			if (game.inProgress) {
				ack(api.fail(game.toString() + " already in progress."));
				return;
			}
			if (game.hasPassword && !game.checkPassword(data.password)) {
				ack(api.fail("Incorrect password."));
				return;
			}
			//TODO is game is progress?
			game.registerSocket(user, socket);
			this.cleanupSocket(socket);
			ack(api.succ());
		});
	}

	this.cleanupSocket = function(socket) {
		api.off(socket, api.calls.GET_GAMES);
		api.off(socket, api.calls.CREATE_GAME);
		api.off(socket, api.calls.JOIN_GAME);
	}

	this.createGame = function(host, name, maxPlayers, password) {
		let id = generateUID();
		while (this.getGame(id)) {
			id = generateUID();
		}
		this.games.push(new Game(api, id, host, name, maxPlayers, password));
		return id;
	}

	this.getCurrentGame = function(user) {
		for (let i = 0; i < this.games.length; i++) {
			for (let j = 0; j < this.games[i].users.length; j++) {
				if (this.games[j].users[j] === user) {
					return this.games[j]
				}
			}
		}
		return null;
	}

	this.getGame = function(id) {
		for (let i = 0; i < this.games.length; i++) {
			if (this.games[i].id === id) {
				return this.games[i];
			}
		}
		return null;
	}

	this.removeGame = function(game) {
		for (let i = 0; i < this.games.length; i++) {
			if (games[i] === game) {
				this.games.splice(i, 1);
			}
		}
	}
}


exports = module.exports = Lobby;
