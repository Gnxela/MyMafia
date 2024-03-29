var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var sha = require('sha2');

global.rootDir = path.resolve(__dirname + "/..");
global.passwordSalt = "gamesaltbvasd";
defineGlobals();

var httpHandler = new require('./httpHandler.js')(app, http);

var Server = require('./server/server.js');
global.server = new Server(http);

process.on('SIGINT', function(code) {
	server.close();
	process.exit();
});

function defineGlobals() {
	global.error = function(str, obj) {
		if (obj) {
			console.error(str + JSON.stringify(obj));
		} else {
			console.error(str);
		}
	}
	global.log = function(str, obj) {
		if (obj) {
			console.log(str + JSON.stringify(obj));
		} else {
			console.log(str);
		}
	}

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
		if (!text || text === "\n") {
			return undefined;
		}
		return JSON.parse(text);
	}

	global.loadFile = function(file) {
		return fs.readFileSync(file);
	}
}
