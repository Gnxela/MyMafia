function Frame(name) {

	this.name = name;
	this.actions = [];

	this.addAction = function(action) {
		this.actions.push(action);
	}

}

exports = module.exports = Frame;
