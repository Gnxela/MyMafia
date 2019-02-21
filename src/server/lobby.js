var users = require('./users.js');

var lobby = {games: []};

lobby.createGame = function(data, callback) {
	games.push({started: false, password: data.password, maxPlayers: data.maxPlayers, players: []});
	callback(true);
}

exports = module.exports = lobby;
