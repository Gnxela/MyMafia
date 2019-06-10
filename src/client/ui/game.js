function Game() {
	this.open = async function() {
		let game = await getGame();
		container.innerHTML = '';

			console.log(game);

		let frameContainer = createFrame(game.frames[game.frames.length - 1]);
		container.appendChild(frameContainer);
	}

	function createFrame(frame) {
		let frameContainer = createDiv("frame-container");

		let frameHeader = createDiv("frame-header");
		let framePrev = createButton("frame-prev");
		let frameNext = createButton("frame-next");
		let frameTitle = createDiv("frame-name");
		frameTitle.innerHTML = frame.name;
		frameHeader.appendChild(framePrev);
		frameHeader.appendChild(frameTitle);
		frameHeader.appendChild(frameNext);
		frameContainer.appendChild(frameHeader);

		let actionContainer = createDiv("action-container");
		for (let i = 0; i < frame.actions.length; i++) {
			let action = frame.actions[i];
			actionContainer.appendChild(createAction(action));
		}
		frameContainer.appendChild(actionContainer);

		return frameContainer;
	}

	function createAction(action) {
		console.log(action);
		let a = createDiv("", "action " + action.type);
		a.innerHTML = formatAction(action.format, action.users);
		return a;
	}

	function formatAction(format, users) {
		let str = format;
		let userIndex = 0;
		let index;
		while ((index = str.indexOf("%u")) != -1) {
			str = str.substring(0, index) + users[userIndex++].username + str.substring(index + 2);
	    }
		return str;
	}

	this.close = async function() {

	}
}
