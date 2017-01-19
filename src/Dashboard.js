import Sidebar from './components/Sidebar';
import React, { Component } from 'react';
import fetch from "isomorphic-fetch";
import "./Dashboard.css";
import { Breadcrumb, Button, Popover, Card, Icon, notification } from 'antd';

var core_info = require('./core_info').core_info;
var event_center = require('./event').event_center;

class Dashboard extends Component {
  constructor() {
    super(...arguments);

    this.session_id = this.props.location.query.session_id;
	this.state = {current_session_info: {}};

	}

	componentDidMount() {
		event_center.send({
						publish: {
							topic:"PV.Dashboard",
							session_id:"*",
							payload:{}
						}
					});
		core_info.addObserver('dash', (current_session_info, session_list) => {
			var info = this.state.current_session_info;
			if (info && info.session_id && info.connect_status !== current_session_info.connect_status) {
				if (current_session_info.connect_status === 1) {
					notification['info']({
						message: '提示',
						description: '该设备已重新连接',
					});
				} else if (current_session_info.connect_status === 2) {
					notification['warning']({
						message: '提示',
						description: '该设备处于异常状态',
					});
				} else {
					notification['error']({
						message: '提示',
						description: '该设备已断开连接',
					});
				}
			}
			this.setState({current_session_info: current_session_info});
		});
		core_info.change_current_session_id(this.session_id);

		event_center.register_and_subscribe("Hotfix.Exec.Response", this.session_id, this);
	}

	componentWillUnmount() {
		core_info.removeObserver('dash');
		event_center.unregister_and_unsubscribe("Hotfix.Exec.Response", this.session_id, this);
	}

	handle_event(connect, action, topic, session_id, message) {
		if (topic !== "Hotfix.Exec.Response") 
			return;

		var response_code = message.payload.response_code;
		var response = message.payload.response;
		notification['info']({
			message: '提示',
			description: `${response_code}: ${response}`
		});
	}


  render() {
    var currentPath = this.props.location.pathname;
	var device_name = this.state.current_session_info.device_name;
	var did = this.state.current_session_info.did;
	var platform = this.state.current_session_info.platform;
	var os_version = this.state.current_session_info.os_version;
	var app_name = this.state.current_session_info.app_name;
	var app_version = this.state.current_session_info.app_version;
	var connect_status = this.state.current_session_info.connect_status;

	var platform_icon = (<Icon type="apple" style={{marginRight:'100px', fontSize:'40px'}}/>);
	if (platform && platform.toLowerCase() === "android")
		platform_icon = (<Icon type="android" style={{marginRight:'100px', fontSize:'40px'}}/>);

	var connected_icon;
	if (connect_status === 1) {
		connected_icon = (<Icon type="smile" style={{color:'#7ED321'}}/>);
	} else {
		connected_icon = (<Icon type="frown" style={{color:'#D0021B'}}/>);
	}

	var pop_content = (
		<div style={{
			padding:'10px',
			display: 'flex',
			WebkitAlignItems: 'center',
			alignItems: 'center',
			justifyContent: 'center',
		}}>
			{platform_icon}
			<table style={{borderSpacing: '10px 6px'}}>
				<tbody>
				<tr>
					<td style={{ textAlign:"right", color:"#9B9B9B" }}>设备名:</td>
					<td style={{ textAlign:"left", color:"#4A4A4A" }}>{device_name}</td>
				</tr>
				<tr>
					<td style={{ textAlign:"right", color:"#9B9B9B" }}>设备ID:</td>
					<td style={{ textAlign:"left", color:"#4A4A4A" }}>{did}</td>
				</tr>
				<tr>
					<td style={{ textAlign:"right", color:"#9B9B9B" }}>系统版本:</td>
					<td style={{ textAlign:"left", color:"#4A4A4A" }}>{`${platform} ${os_version}`}</td>
				</tr>
				<tr>
					<td style={{ textAlign:"right", color:"#9B9B9B" }}>App/Version:</td>
					<td style={{ textAlign:"left", color:"#4A4A4A" }}>{`${app_name}/${app_version}`}</td>
				</tr>
				<tr>
					<td style={{ textAlign:"right", color:"#9B9B9B" }}>在线状态:</td>
					<td style={{ textAlign:"left", color:"#4A4A4A" }}>{connected_icon}</td>
				</tr>
				</tbody>
			</table>
		</div>
	);

	var pop_img = platform === "iOS" ? "/resource/logo_red_ios.png" : "/resource/logo_red_android.png";
	var pop_img_bg = "/resource/logo_red_bg.png";
	if (connect_status === 1) {
		pop_img = platform === "iOS" ? "/resource/logo_green_ios.png" : "/resource/logo_green_android.png";
		pop_img_bg = "/resource/logo_green_bg.png";
	}

	var icon = <Icon type="apple" />;
	if (platform === 'Android') {
		icon = <Icon type="android"/>;
	}

	var status_icon = connect_status === 1 ? <img height='12px' src="/resource/status_green.png"/> : <img height='12px' src="/resource/status_red.png"/>;
    return (
		<div>
			<div style={{backgroundColor:'#f4f4f4', paddingTop:'10px', paddingBottom:'10px'}}>
			<Breadcrumb>
				<Breadcrumb.Item>{status_icon}<span style={{marginLeft:'10px'}}>{device_name}</span></Breadcrumb.Item>
				<Breadcrumb.Item>{icon}</Breadcrumb.Item>
				<Breadcrumb.Item>{did}</Breadcrumb.Item>
				<Breadcrumb.Item>{app_name}</Breadcrumb.Item>
				<Breadcrumb.Item>{app_version}</Breadcrumb.Item>
			</Breadcrumb>
			</div>
			<div className="ant-layout-container">
				<aside className="ant-layout-sider">
					<Sidebar  currentPath={currentPath} session_id={this.session_id}/>
				</aside>
				<div className="ant-layout-content">
					{this.props.children}
				</div>
			</div>
		</div>
    );

  }
}

module.exports = Dashboard;
