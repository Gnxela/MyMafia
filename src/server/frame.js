var Action = require("./action.js");

function Frame(name) {

	this.name = name;
	this.actions = [];

	this.addAction = function(type, format, users) {
		this.actions.push(new Action(type, format, users));
	}

}

exports = module.exports = Frame;
