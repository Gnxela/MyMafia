var container;

function openPage(page) {
	switch (page) {
	case 'lobby':
		openLoby();
		break;
	case 'game':
		openGame();
		break;
	case 'createGame':
		openCreateGame();
		break;
	default:
		throw "Invalid page: " + page;
	}
	container.className = page;
}

function openGame() {
	container.innerHTML = 'game!';
}

function openLoby() {
	container.innerHTML = '';

	let refreshGames = async function() {
		document.getElementById("games-container").innerHTML = "";
		let games = await getGames();
		for (let i = 0; i < games.length; i++) {
			let game = games[i];
			let gameDiv = createDiv("", "game");
			let hasPassword = createDiv("", (game.hasPassword ? "has" : "no") + "-password password");
			gameDiv.appendChild(hasPassword);
			let players = createDiv("", "num-players");
			players.innerHTML = game.users.length;
			gameDiv.appendChild(players);
			let maxPlayers = createDiv("", "max-players");
			maxPlayers.innerHTML = game.maxPlayers;
			gameDiv.appendChild(maxPlayers);
			let joinGamee = createButton("Join", "", "join");
			joinGamee.addEventListener('click', () => joinGame(game.id));
			gameDiv.appendChild(joinGamee);

			gamesContainer.appendChild(gameDiv);
		}
	}

	let header = createDiv("header")
	container.appendChild(header);

	let createGamee = createButton("Create Game", "create-game");
	createGamee.addEventListener('click', () => openPage('createGame'));
	header.appendChild(createGamee);
	let refresh = createButton("Refresh", "refresh");
	refresh.addEventListener('click', refreshGames);
	header.appendChild(refresh);

	let gamesContainer = createDiv("games-container")
	container.appendChild(gamesContainer);

	refreshGames()
}

function openCreateGame() {
	container.innerHTML = '<input id="name" /><input id="maxPlayers" /><input id="password" />';
	let create = createButton("Create Game", "create-game")
	create.addEventListener('click', () => {
		// TODO Verify data
		let nameInput = document.getElementById("name");
		let maxPlayersInput = document.getElementById("maxPlayers");
		let passwordInput = document.getElementById("password");
		createGame(nameInput.value, parseInt(maxPlayersInput.value), passwordInput.value)
	});
	container.appendChild(create);
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
