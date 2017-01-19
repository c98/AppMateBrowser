
/*
 * Here to store some global data.
 */

var topic_match = require('./utils').topic_match;
var event_center = require('./event').event_center;

class CoreInfo 
{
	constructor() {
		this.current_session_id = '';
		this.current_session_info = {};
		this.session_list = [];
		this.observers = {};

		this.init();
	}

	init() {
		event_center.register_and_subscribe("session.list", '*:*:*', this);
	}

	handle_event(connect, action, topic, session_id, message) {
		if (!connect || !action || !topic || !session_id || !message)
			return;

		if (topic_match(topic, "session.list"))
			this.handle_session_list(message);
	}

	handle_session_list(message) {
		if (!message || !message.payload)
			return;

		this.session_list = message.payload;

		for (var sessionInfo of this.session_list) {
			if (sessionInfo.session_id === this.current_session_id) {
				this.current_session_info = sessionInfo;
				break;
			}
		}
		this.notify();
	}


	change_current_session_id(current_session_id) {
		if (!current_session_id)
			return;

		this.current_session_id = current_session_id;

		for (var sessionInfo of this.session_list) {
			if (sessionInfo.session_id === this.current_session_id) {
				this.current_session_info = sessionInfo;
				this.notify();
				break;
			}
		}
	}

	notify() {
		for (var observer_key in this.observers) {
			if (this.observers.hasOwnProperty(observer_key)) {
				var callback = this.observers[observer_key];
				callback(this.current_session_info, this.session_list);
			}
		}
	}

	addObserver(observer_key, callback) {
		if (!observer_key || !callback)
			return;

		if (!this.observers[observer_key])
			this.observers[observer_key] = callback;

		if (this.current_session_info.session_id) {
			callback(this.current_session_info, this.session_list);
		}
	}

	removeObserver(observer_key) {
		if (!observer_key)
			return;

		if (this.observers[observer_key])
			delete this.observers[observer_key];
	}
}

var core_info = new CoreInfo();

module.exports = {core_info};
