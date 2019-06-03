var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var io = require('socket.io')(http);
var sha = require('sha2');

global.rootDir = path.resolve(__dirname + "/..");
global.passwordSalt = "gamesaltbvasd";
defineGlobals();

var Server = require('./server/server.js');
var api = require('./api.js');
var httpHandler = require('./httpHandler.js')(http, app);

var server = new Server(io);

io.on('connection', function(socket) {
	api.once(socket, api.HANDSHAKE, function(data) {
		server.registerSocket(socket);
	});
});

function defineGlobals() {
	global.generateUID = function() {
		return sha.sha224(Math.random().toString()).toString('hex');
	}

	global.writeJSONFile = function(file, object) {
		return writeFile(file, JSON.stringify(object, null, 2))
	}

	global.writeFile = function(file, text) {
		fs.writeFileSync(file, text);
	}

	global.loadJSONFile = function(file) {
		let text = loadFile(file);
		if (text == "" || text == "\n") {
			return undefined;
		}
		return JSON.parse(text);
	}

	global.loadFile = function(file) {
		return fs.readFileSync(file);
	}
}
