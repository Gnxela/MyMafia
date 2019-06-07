var container;
var currentUI;

function openPage(page) {
	if (currentUI) {
		currentUI.close();
	}
	switch (page) {
	case 'lobby':
		currentUI = new Lobby();
		break;
	case 'game':
		currentUI = new Game();
		break;
	case 'createGame':
		currentUI = new CreateGame();
		break;
	default:
		throw "Invalid page: " + page;
	}
	container.className = page;
	currentUI.open();
}

function createButton(text, id, clazz) {
	let button = document.createElement("button");
	button.innerHTML = text;
	if (id) {
		button.id = id;
	}
	if (clazz) {
		button.className = clazz;
	}
	return button;
}

function createDiv(id, clazz) {
	let div = document.createElement("div");
	if (id) {
		div.id = id;
	}
	if (clazz) {
		div.className = clazz;
	}
	return div;
}
