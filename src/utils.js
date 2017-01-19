
/*
 * utils function.
 */

var topic_match = function(topic, pattern) {
	if (!topic || !pattern)
		return false;

	pattern = pattern.replace(/\./g, '\\.');
	pattern = pattern.replace(/\*/g, '.*');
	pattern = "^" + pattern + "$";
	var pattern_regex = new RegExp(pattern);
	if (!pattern_regex || !pattern_regex.test(topic))
		return false;

	return true;
}

var session_id_match = function(session_id, pattern) {
	if (!pattern || !session_id)
		return false;
	
	pattern = pattern.replace(/\./g, '\\.');
	pattern = pattern.replace(/\*/g, '.*');
	pattern = "^" + pattern + "$";
	var pattern_regex = new RegExp(pattern);
	if (!pattern_regex || !pattern_regex.test(session_id))
		return false;

	return true;
}
/*
 * event callback
 *
 * @param default_cb	the callback if no plugin can resolve the event.
 */

var event_callback = function(connect, action, topic, session_id, message, topic_table, default_cb) {
	if (!connect || !action || !topic || !message)
		return;

	var modules = [];
	for (let pattern in topic_table) {
		if (topic_table.hasOwnProperty(pattern)) {
			var module_list = [];
			if (topic_match(topic, pattern))
				module_list = topic_table[pattern];		

			if (module_list.length) 
				modules = modules.concat(module_list);
		}
	}

	if (modules.length === 0) {
		if (default_cb) 
			default_cb(message);
		
		return;
	}

	for (var module of modules) {
		// module handler connect with the message
		module.handle_event(connect, action, topic, session_id, message);
	}
}


/**
 * string support format template.
 */
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
					return typeof args[number] != 'undefined'
						? args[number]
						: match
						;
				});
	};
}

module.exports = {event_callback, topic_match, session_id_match};
