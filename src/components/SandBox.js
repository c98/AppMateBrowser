import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Breadcrumb, Table, Icon } from 'antd';


var topic_match = require('../utils').topic_match;
var event_center = require('../event').event_center;
var sandboxjs = require('./sandbox.hotfix').sandboxjs;
var previewjs = require('./sandbox.hotfix').previewjs;


class SandBox extends Component {

	constructor() {
		super(...arguments);

		this.session_id = this.props.location.query.session_id;

		this.state = {
			sandbox:[],
			current_dir:'.'
		};
	}

	componentDidMount() {
		event_center.send({
						publish: {
							topic:"PV.Sandbox",
							session_id:"*",
							payload:{}
						}
					});
		event_center.register_and_subscribe('sandbox', this.session_id, this);
		this.fetch(sandboxjs.format(this.state.current_dir));
	}
	
	componentWillUnmount() {
		event_center.unregister_and_unsubscribe('sandbox', this.session_id, this);
	}

	handle_event(connect, action, topic, session_id, message) {
		if (!connect || !action || !topic || !session_id || !message)
			return;

		if (topic_match(message.topic, "sandbox")) 
			this.handle_response(message);
	}

	handle_response(message) {
		if (!message || !message.payload)
			return;

		var sandbox = JSON.parse(message.payload.message);	
		var current_dir = message.payload.current_dir;	
		this.setState({sandbox: sandbox, current_dir: current_dir});
	}

	handle_file_preview(message) {
		if (!message || !message.payload)
			return;

		var url = message.payload.message;
		if (url) {
			// TODO: open tab to load file url.
			window.location.href = url;	
		}
	}

	fetch(content) {
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

	handle_click_file(e) {
		// TODO: show preview.
	}

	handle_click_directory(e) {
		event_center.send({
						publish: {
							topic:"EventStats.Click.Sandbox.Dir",
							session_id:"*",
							payload:{}
						}
					});
		var choose_dir = e.currentTarget.innerText;
		var dir = this.state.current_dir+'/'+choose_dir;
		this.fetch(sandboxjs.format(dir));
		this.setState({current_dir:dir});
	}

	handle_click_crumbitem(e) {

		event_center.send({
						publish: {
							topic:"EventStats.Click.Sandbox.CrumbItem",
							session_id:"*",
							payload:{}
						}
					});
		var index = e.currentTarget.getAttribute('data-id');
		var dir_components = this.state.current_dir.split('/');	
		var dir = '.';
		for (var i = 1; i <= index; i++) {
			dir = dir + '/' + dir_components[i];		
		}
		this.fetch(sandboxjs.format(dir));
		this.setState({current_dir:dir});
	}

	render() {
		const columns = [{
			title: '文件名',
			dataIndex: 'NSFileName',
			key: 'NSFileName',
			render: (text, record) => {
				if (record.NSFileType === 'NSFileTypeDirectory') {
					return ( 
							<span style={{ 
								color:'#2DB7F5',
								cursor:'pointer'
							}} onClick={this.handle_click_directory.bind(this)}>
								<Icon type="folder" style={{
									color:'#2DB7F5',
									marginRight:'5px'
								}}/>
								{text}
							</span>
				   )
				} else {
					return ( 
							<span onClick={this.handle_click_file.bind(this)}>
								<Icon type="file-text" style={{
									marginRight:'5px'
								}}/>
								{text}
							</span>
				   )
				}
			}
		}, {
			title: '大小',
			dataIndex: 'NSFileSize',
			key: 'NSFileSize',
		}, {
			title: '修改时间',
			dataIndex: 'NSFileModificationDate',
			key: 'NSFileModificationDate',
		}];

		var items = [];
		if (this.state.current_dir.length > 1) {
			items = this.state.current_dir.split('/').map((dir, index)=>{
				if (index === 0) {
					return (
						<Breadcrumb.Item key={index} data-id={index} onClick={this.handle_click_crumbitem.bind(this)} style={{ cursor:'pointer' }}>Home</Breadcrumb.Item>
					)
				} else {
					return (
						<Breadcrumb.Item key={index} data-id={index} onClick={this.handle_click_crumbitem.bind(this)} style={{ cursor:'pointer' }}>{dir}</Breadcrumb.Item>
					);
				}
			});
		}
		var home = (
			<Breadcrumb>
				{items}	
			</Breadcrumb>
		);

		var dataSource = this.state.sandbox;


		return (
			<div>
				<div style={{
					display:'flex',
					alignItems:'center',
					minHeight:'50px'
				}}>
					{home}
				</div>
				<Table dataSource={dataSource} columns={columns} />
			</div>
		);
	}
}


export default SandBox;
