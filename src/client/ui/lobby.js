function Lobby() {

	let refreshGames = async function() {
		let gamesContainer = document.getElementById("games-container")
		gamesContainer.innerHTML = "";
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
			joinGamee.addEventListener('click', async () => {
				if (await joinGame(game.id)) {
					openPage("game");
				} else {
					console.log("Failed to join game.");
				}
			});
			gameDiv.appendChild(joinGamee);

			gamesContainer.appendChild(gameDiv);
		}
	}


	this.open = async function() {
		container.innerHTML = '';

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

		await refreshGames()
	}

	this.close = async function() {

	}
}
