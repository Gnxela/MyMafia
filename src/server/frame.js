function Frame(name) {

	this.name = name;
	this.actions = [];

	this.addAction = function(action) {
		actions.push(action);
	}

}

exports = module.exports = Frame;
