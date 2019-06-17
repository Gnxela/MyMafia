function Game() {

	let frames = [];

	this.open = async function() {
		container.innerHTML = 'Loading...';
		let game = await getGame();
		frames = game.frames;
		let frameContainer = createDiv("frame-container");
		for (let i = 0; i < frames.length; i++) {
			let frame = createFrame(i);
			frameContainer.appendChild(frame);
		}
		container.innerHTML = '';
		container.appendChild(frameContainer);

		api.on(socket, api.calls.NEW_FRAME, (data) => {
			frames.push(data.frame);
			let frame = createFrame(frames.length - 1);
			frameContainer.appendChild(frame);
		});
		api.on(socket, api.calls.UPDATE_FRAME, (data) => {
			frames[data.frameIndex] = data.frame;
			updateFrame(data.frameIndex);
		});
	}

	function updateFrame(frameIndex) {
		let newFrame = createFrame(frameIndex);
		let domFrame = document.getElementById("frame-" + frameIndex);
		domFrame.innerHTML = newFrame.innerHTML;
	}

	function createFrame(index) {
		let frame = frames[index];
		let frameContainer = createDiv("frame-" + index, "frame");

		let frameHeader = createDiv("frame-header");
		let framePrev = createButton("<", "frame-prev");
		let frameNext = createButton(">", "frame-next");
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
