function Game(maxPlayers, passwd) {
	var password = passwd;

	this.maxPlayers = maxPlayers;
	this.hasPassword = password === "";

	this.checkPassword = function(passwd) {
		return password === passwd;
	}
}

exports = module.exports = Game;
