var api = require("../api.js")
var Game = require("./game.js")

function Lobby(io) {
	this.games = [];

	api.on(io, api.GET_GAMES, (data, ack) => {
		ack(this.games);
	});

	api.on(io, api.CREATE_GAME, (data, ack) => {
		this.createGame(data.maxPlayers, data.password);
		ack(api.succ());
	});

	this.createGame = function(maxPlayers, password) {
		this.games.push(new Game(maxPlayers, password));
	}
}


exports = module.exports = Lobby;
