function Frame(name) {

	this.name = name;
	this.actions = [];

	this.addAction = function(type, format, users) {
		this.actions.push(new Action(type, format, users));
	}

}

function Action(type, format, users) {
	this.type = type;
	this.format = format;
	this.users = users;
}

exports = module.exports = Frame;
