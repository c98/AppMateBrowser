
var event_callback = require('./utils').event_callback;

class EventCenter {
	constructor() {
		this.topic_table = {};
		this.wait4send = [];
		this.ws = new WebSocket('ws://localhost:8011');
		this.ws.onopen = this.on_open.bind(this);
		this.ws.onmessage = this.on_message.bind(this);
	}

	register(topic, module) {
		if (topic && module) {
			var modules = this.topic_table[topic];
			if (!modules)
				modules = [];

			if (modules.indexOf(module) === -1) {
				modules.push(module);
				this.topic_table[topic] = modules;
			}
		}
	}

	unregister(topic, module) {
		if (topic && module) {
			var modules = this.topic_table[topic];
			if (!modules)
				return;

			let index = modules.indexOf(module);
			if (index === -1)
				return;

			modules.splice(index, 1);
			this.topic_table[topic] = modules;
		}
	}

	subscribe(topic, session_id) {
		if (!topic || !session_id)
			return;

		var message = {
			subscribe:{
				topic:topic,
				session_id:session_id
			}
		};
		this.send(message);
	}

	unsubscribe(topic, session_id) {
		if (!topic || !session_id)
			return;

		var message = {
			unsubscribe:{
				topic:topic,
				session_id:session_id
			}
		};
		this.send(message);
	}

	register_and_subscribe(topic, session_id, module) {
		if (!topic || !session_id || !module)
			return;

		this.register(topic, module);
		this.subscribe(topic, session_id);
	}

	unregister_and_unsubscribe(topic, session_id, module) {
		if (!topic || !session_id || !module)
			return;

		this.unregister(topic, module);
		this.unsubscribe(topic, session_id);
	}

	publish(topic, session_id, params, module){
		if (!topic || !session_id || !module)
			return;

		this.register(topic, module);
		var message = {
			publish:{
				topic:topic,
				session_id:session_id,
				payload:params
			},
			subscribe:{
				topic:topic,
				session_id:session_id
			}
		};
		this.register(topic, module)
		this.send(message)

	}

	send(message) {
		switch(this.ws.readyState) {
			case 0:
				this.wait4send.push(message);
				break;

			case 1:
				this.ws.send(JSON.stringify(message));
				break;


			default:
				break;
		}
	}

	on_open(evt) {
		// some init work.
		this.wait4send.map((message) => {
			return this.ws.send(JSON.stringify(message));
		});
	}

	on_message(evt) {
		var data = evt.data;
		var message = {};
		try {
			message = JSON.parse(data);
		} catch(err) {
			return;
		}

		if (!message)
			return;

		for (let action in message)
			if (message.hasOwnProperty(action)) {
				event_callback(this.ws,
						action,
						message[action].topic,
						message[action].session_id,
						message[action],
						this.topic_table);
			}
	}

};
var event_center = new EventCenter();

module.exports = {event_center};
