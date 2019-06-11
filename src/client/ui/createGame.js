function CreateGame() {

	this.open = async function() {
		container.innerHTML = '<input id="name" placeholder="Name" /><input id="maxPlayers" placeholder="Max Players"/><input id="password" placeholder="Password"/>';
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

	this.close = async function() {

	}
}
