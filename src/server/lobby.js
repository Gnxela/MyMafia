var Game = require("./game.js")

function Lobby(io, api) {
	this.games = [];

	this.registerSocket = function(socket) {
		api.on(socket, api.calls.GET_GAMES, (data, ack) => {
			ack(this.games);
		});

		api.on(socket, api.calls.CREATE_GAME, (data, ack) => {
			this.createGame(data.maxPlayers, data.password);
			ack(api.succ());
		});
	}

	this.createGame = function(maxPlayers, password) {
		this.games.push(new Game(maxPlayers, password));
	}
}


exports = module.exports = Lobby;
