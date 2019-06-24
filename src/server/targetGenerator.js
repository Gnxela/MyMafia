function TargetGenerator(users /*, roleMap*/) {
	this.users = users.map((user) => user.username);

	this.all = function() {
		return this.users.slice();
	}

	this.allBut = function(user) {
		return this.users.slice().splice(this.users.indexOf(user.username), 1);
	}

	this.nobody = function() {
		return [];
	}

	this.addNoVote = function(targets) {
		targets.push("");
	}
}

expors = module.exports = TargetGenerator;