var Frame = require("./frame.js");
var Emitter = require("./emitter.js");
var TargetGenerator = require("./targetGenerator.js");
var events = require("./events.js");

function Game(api, id, host, name, maxPlayers, passwd) {
	this.id = id;
	this.host = host;
	this.name = name;
	this.maxPlayers = maxPlayers;
	this.hasPassword = password !== "";
	this.users = [host];
	this.inProgress = false;
	this.isFinished = false;
	this.frames = [];
	this.timings = {
		night: 30,
		day: 60,
		dayVote: 15,
	}

	var password = passwd;
	var room = "game-" + id;
	var emitter = new Emitter();
	var targetGenerator = new TargetGenerator(this.users);
	var resolveSleep;
	//var roles = {}; //username -> Role

	this.init = function() {
		let frame = this.createFrame("Pre-game");
		frame.addAction("create_game", "%u created the game.", [host]);
		frame.addAction("users", "Players: %u", this.users);
	}

	this.registerSocket = function(user, socket) {
		emitter.emit(events.SOCKET_LOAD, {user: user, socket: socket})
		if (user === host) {
			api.on(socket, api.calls.START_GAME, (user, data, ack) => {
				this.startGame();
				api.off(socket, api.calls.START_GAME);
				ack(api.succ());
			});
		}

		api.on(socket, api.calls.GET_GAME, (user, data, ack) => {
			let game = this;
			if (game.users.includes(user)) {
				ack({game: game});
			}
			ack(api.fail("Invalid request (not sure how but you registered for a game you're not in)."));
		});

		socket.join(room);
		if (this.users.includes(user)) {
			log(user.toString() + " already in game.");
			return;
		}
		this.users.push(user);
		emitter.emit(events.USER_JOIN, {user: user})
		let currentFrame = this.getCurrentFrame();
		currentFrame.actions[1].format += ", %u";
		this.updateCurrentFrame();
		log(user.toString() + " joined " + this.toString());
	}

	this.startGame = function() {
		if (this.inProgress) {
			return;
		}
		this.inProgress = true;
		this.runCycle(0);
	}

	//Runs one day/night cycle
	this.runCycle = async function(nightNumber) {
		this.createFrame("Night " + nightNumber);
		await sleep(this.timings.night * 1000);
		this.createFrame("Day " + (nightNumber + 1));
		await sleep(this.timings.day * 1000);
		// Start vote
		await sleep(this.timings.dayVote * 1000);
		// End vote
	}

	this.getCurrentFrame = function() {
		return this.frames[this.frames.length - 1];
	}

	this.createFrame = function(name) {
		let frame = new Frame(name);
		this.frames.push(frame);
		api.emitRoom(room, api.calls.NEW_FRAME, {frame: frame});
		return frame;
	}

	this.updateCurrentFrame = function() {
		this.updateFrame(this.frames.length - 1);
	}

	this.updateFrame = function(frameIndex) {
		api.emitRoom(room, api.calls.UPDATE_FRAME, {frameIndex: frameIndex, frame: this.frames[frameIndex]});
	}

	this.checkPassword = function(passwd) {
		return password === passwd;
	}

	this.toString = function() {
		return "<game " + this.id + ">"
	}

	function sleep(ms) {
		return new Promise(resolve => {
			resolveSleep = resolve;
			setTimeout(resolve, ms);
		});
	}

	this.init();
}

exports = module.exports = Game;
