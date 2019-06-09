function Game() {
	this.open = async function() {
		let game = await getGame();
		container.innerHTML = game.id;
		//TODO make ui
	}

	this.close = async function() {

	}
}
