import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Table, AutoComplete, Switch, Input } from 'antd';

const Search = Input.Search;


var topic_match = require('../utils').topic_match;
var event_center = require('../event').event_center;


var columns = [{
	title: 'topic',
	dataIndex: 'topic',
	width: '150px'
}, {
	title: 'content',
	dataIndex: 'content',
}, {
	title: 'time',
	dataIndex: 'time',
	width: '63px',
	render: (text, record, index) => record.time.split(' ')[1]
}, {
	title: 'extra',
	dataIndex: 'extra',
	width: '250px'
}];

class Log extends Component {

	constructor() {
		super(...arguments);

		this.interval_id = null;
		this.render_lock = false;
		this.switch_on = true;
		this.session_id = this.props.location.query.session_id;
		this.filter_topic = '';
		this.logs = [];
		this.topics = [];
		this.state = {
			filter_logs:[],
			search_logs:[],
			topics: []
		};
	}

	componentDidMount() {
		this.do_subscribe(this.session_id);
		function timer() {
			this.load_filter_log();
		}
		this.interval_id = setInterval(timer.bind(this), 1000);

		event_center.send({
						publish: {
							topic:"PV.Log",
							session_id:"*",
							payload:{}
						}
					});
	}

	componentWillUnmount() {
		this.do_unsubscribe(this.session_id);
		clearInterval(this.interval_id);
	}

	handle_event(connect, action, topic, session_id, message) {
		if (!connect || !action || !topic || !session_id || !message)
			return;

		if (topic_match(message.topic, "*.Log"))
			this.handle_realtime_log(message);
	}

	do_subscribe(session_id) {
		if (!session_id)
			return;

		event_center.register_and_subscribe("*.Log", session_id, this);
	}

	do_unsubscribe(session_id) {
		if (!session_id)
			return;

		event_center.unregister_and_unsubscribe("*.Log", session_id, this);
	}

	handle_realtime_log(message) {
		var payload = message.payload;
		if (!message || !payload)
			return;

		if (!message.topic || topic_match(message.topic, "*Performance.*"))
			return;
		var small_topic = message.topic.replace(".Log","")
		if(!small_topic){
			small_topic = "default"
		}
		if (this.topics.indexOf(small_topic) === -1)
			this.topics.push(small_topic);

		if (this.logs.length >= 1000) {
			var to_be_dropped = this.logs.slice(0, 50);
			to_be_dropped.map((topic) => {
						let index = this.topics.indexOf(topic);
						if (index !== -1)
							this.topics.splice(index, 1);

						return 0;
					});
			this.logs = this.logs.slice(50, this.logs.length);
		}

		var time = payload.time ? payload.time : '';
		this.logs.unshift({
				topic:small_topic,
				content:payload.message,
				time:time,
				extra:`${payload.fileName}:${payload.functionName}:${payload.line}`});
	}

	on_filter_change(filter) {

		event_center.send({
						publish: {
							topic:"EventStats.Input.LogFilter",
							session_id:"*",
							payload:{}
						}
					});

		this.filter_topic = filter;
		this.load_filter_log();
	}

	on_select_topic(topic) {
		event_center.send({
						publish: {
							topic:"EventStats.Select.LogTopic",
							session_id:"*",
							payload:{}
						}
					});

		if (!topic)
			return;

		this.filter_topic = topic;
		this.load_filter_log();
	}

	load_filter_log() {
		var filter_logs = [];
		for (var log of this.logs) {
			if (this.filter_topic === '' || log.topic.toLowerCase().indexOf(this.filter_topic.toLowerCase()) !== -1)
				filter_logs.push(log);
		}

		this.setState({filter_logs: filter_logs, topics:this.topics});
		this.on_search_content(this.refs.search.refs.input.value);
	}

	handle_switch(on) {
		event_center.send({
						publish: {
							topic:"EventStats.Switch.Log",
							session_id:"*",
							payload:{}
						}
					});

		if (on) {
			this.do_subscribe(this.session_id);
		} else {
			this.do_unsubscribe(this.session_id);
		}
	}

	on_search_content(value) {
		if (!value) {
			value = "";	
		}

		var search_logs = [];
		for (var entry of this.state.filter_logs) {
			if (entry.content.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
				search_logs.push(entry);
			}
		}
		this.setState({search_logs:search_logs});
	}

	render() {
		return (
			<div>
				<div style={{
					textAlign:'left',
					display:'flex',
					flexWrap: 'wrap',
					marginBottom:'10px'
				}}>
					<AutoComplete
						dataSource={this.state.topics}
						placeholder='topic 过滤'
						style={{
							width: 200,
						}}
						onSelect={this.on_select_topic.bind(this)}
						onChange={this.on_filter_change.bind(this)}
					/>
					<div style={{flex:1}}/>
					<Input ref="search" placeholder="实时搜索关键词" onPressEnter={this.on_search_content.bind(this)}/>
					<div style={{flex:9}}/>
					<div>
						<span style={{fontSize:'14px', color:'#a4a4a4'}}>实时开关   </span>
						<Switch checkedChildren={'开'} unCheckedChildren={'关'} defaultChecked={true} onChange={this.handle_switch.bind(this)} />
					</div>
				</div>
				<div style={{ margin:'auto'}} >
					<Table pagination={{ pageSize:50}} columns={columns} dataSource={this.state.search_logs} size="middle" scroll={{ y: 400 }}/>
				</div>
			</div>
		);
	}
}

export default Log;
