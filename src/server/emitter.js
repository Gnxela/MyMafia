function Emitter() {
	var eventListeners = {}; // event -> list of listeners

	this.emit = function(event, data) {
		this.emitSync(event, data);
	}

	this.emitSync = async function(event, data) {
		let canceled = false;
		let cancel = function() {canceled = true;};
		let listeners = eventListeners[event];
		if (!listeners) {
			return data;
		}
		let toBeRemoved = [];
		for (let i = 0; i < listeners.length; i++) {
			let listener = listeners[i];
			await listener.callback(data, cancel);
			if (listener.once) {
				toBeRemoved.push(listener);
			}
			if (canceled) {
				break;
			}
		}
		for (let i = 0; i < toBeRemoved.length; i++) {
			listeners.splice(listeners.indexOf(toBeRemoved[i]), 1);
		}
		return data;
	}

	this.on = function(event, priority, callback) {
		addListener(event, priority, callback, false);
	}

	this.once = function(event, priority, callback) {
		addListener(event, priority, callback, true);
	}

	function addListener(event, priority, callback, once) {
		if (!eventListeners[event]) {
			eventListeners[event] = [];
		}
		eventListeners[event].push(new Listener(event, priority, callback, once));
		eventListeners[event].sort(function(a, b) {
			if (a.priority < b.priority) {
				return 1;
			}
			if (a.priority > b.priority) {
				return -1;
			} else {
				return 0;
			}
		});
	}
}

function Listener(event, priority, callback, once) {
	this.event = event;
	this.priority = priority;
	this.callback = callback;
	this.once = once;
}

exports = module.exports = Emitter;
