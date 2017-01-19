import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Input, Button } from 'antd';
import { message as Message } from 'antd';


var topic_match = require('../utils').topic_match;
var event_center = require('../event').event_center;


class Hotfix extends Component {

	constructor() {
		super(...arguments);

		this.session_id = this.props.location.query.session_id;
		this.state = {
			response:{}
		};
	}

	componentDidMount() {
		this.refs.js_input.refs.input.focus();
		event_center.register_and_subscribe("Hotfix.Exec.ACK", this.session_id, this);
		event_center.register_and_subscribe("Hotfix.Exec.ERR", this.session_id, this);
		event_center.send({
						publish: {
							topic:"PV.Hotfix",
							session_id:"*",
							payload:{}
						}
					});
	}
	
	componentWillUnmount() {
		event_center.unregister_and_unsubscribe("Hotfix.Exec.ACK", this.session_id, this);
		event_center.unregister_and_unsubscribe("Hotfix.Exec.ERR", this.session_id, this);
	}

	handle_event(connect, action, topic, session_id, message) {
		if (!connect || !action || !topic || !session_id || !message)
			return;

		console.log(topic);
		if (topic_match(message.topic, "Hotfix.Exec.ACK")) 
			this.handle_hotfix_ack(message);

		if (topic_match(message.topic, "Hotfix.Exec.ERR")) 
			this.handle_hotfix_err(message);
	}


	handle_hotfix_ack(message) {
		if (!message || !message.payload)
			return;

		Message.success("Hotfix 执行成功");
	}

	handle_hotfix_err(message) {
		if (!message || !message.payload)
			return;

		var msg = message.payload.message;

		Message.error("Hotfix 执行异常:"+msg, 10);
	}

	do_js(e) {
		event_center.send({
						publish: {
							topic:"EventStats.Click.Hotfix",
							session_id:"*",
							payload:{}
						}
					});
		var content = this.refs.js_input.refs.input.value;
		var msg = {
			publish: {
				topic:"Hotfix.Exec",
				session_id: this.session_id,
				payload: {
					content:content
				}
			}
		};
		event_center.send(msg);	
	}

	render() {
		return (
		  <div className="App">
			  <div style={{
			 	marginTop:'55px',
				fontSize:'30px',
				color:'#999'
			  }}>Hotfix 测试</div>
			  <span style={{color:'#a4a4a4', opacity:'0.8'}}>(语法请参考官方资料 <a target='blank' href='https://github.com/bang590/JSPatch/wiki/JSPatch-%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95'>github/bang590</a>)</span>
			  <br/>
			  <div style={{
			  	width:'700px',
				height:'1px',
				marginTop:'15px',
				marginBottom:'10px',
				marginLeft:'auto',
				marginRight:'auto',
				background:'#eee'
			  }}/>
			<div style={{maxWidth:'1000px', margin:'auto'}}>
				<Input style={{
					maxWidth:'600px',
					marginTop:'50px',
					marginBottom: '50px',
					marginRight: '30px',
					minHeight:'200px'
				}}
					ref="js_input"
					type="textarea"
					size='large'
					autosize='true'
					placeholder="" /> 
				<br/>
				<Button type="primary" onClick={this.do_js.bind(this)}>执行</Button>
			</div>
		  </div>
		);
	}
}

export default Hotfix;
