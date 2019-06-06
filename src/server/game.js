function Game(id, name, maxPlayers, passwd) {
	var password = passwd;

	this.id = id;
	this.name = name;
	this.maxPlayers = maxPlayers;
	this.hasPassword = password !== "";
	this.users = [];

	this.registerSocket = function(user, socket) {
		if (this.users.includes(user)) {
			return;
		}
		this.users.push(user);
		console.log(user.username + " joined <game " + id + ">")
	}

	this.checkPassword = function(passwd) {
		return password === passwd;
	}
}

exports = module.exports = Game;
