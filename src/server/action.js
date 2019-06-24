function Action(id, actionName, user, targets) {
	this.id = id;
	this.actionName = actionName;
	this.user = user;
	this.targets = targets;
}

exports = module.exports = Action;
