var Game = require("./game.js")

function Lobby() {
	this.games = [];

	this.createGame = function(maxPlayers, password) {
		this.games.push(new Game(maxPlayers, password));
	}
}


exports = module.exports = Lobby;
