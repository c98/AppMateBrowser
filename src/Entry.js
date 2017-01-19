import React, { Component } from 'react';
import './Entry.css';
import { Table, Button, Icon, Popover } from 'antd';
import 'antd/dist/antd.css';
import { browserHistory } from 'react-router';

var core_info = require('./core_info').core_info;
var event_center = require('./event').event_center;


class Entry extends Component {

	constructor() {
		super(...arguments);

		this.state = {
			session_list:[]
		};
		this.session_id = "";
	}

	componentDidMount() {
		core_info.addObserver(this, (current_session_info, session_list) => {
			this.setState({session_list:session_list});
		});
		
		event_center.send({
						publish: {
							topic:"PV.Entry",
							session_id:"*",
							payload:{}
						}
					});
	}

	componentWillUnmount() {
		core_info.removeObserver(this);
	}

	do_connect(e) {
		event_center.send({
						publish: {
							topic:"EventStats.Click.EntryEnter",
							session_id:"*",
							payload:{}
						}
					});
		var session_id = e.currentTarget.getAttribute('data-key');
		this.session_id = session_id;

		for (var sessionInfo of this.state.session_list) {
			if (sessionInfo.session_id === this.session_id) {
				core_info.change_current_session_id(session_id);;

				if (sessionInfo.connect_status === 1) {
					browserHistory.push('/dashboard/log?session_id='+session_id);
				} else {
					browserHistory.push('/dashboard/history?session_id='+session_id);
				}
				break;
			}
		}

	}

	render() {
		const columns = [{
			title: '设备名',
			dataIndex: 'device_name',
			key: 'device_name',
			className:'table_entry',
			width: '150px'
		}, {
			title: '平台',
			dataIndex: 'platform',
			key: 'platform',
			className:'table_entry',
			width: '80px',
			render: (text) => {
				if (text === "iOS") {
					return <Icon type="apple"/>
				} else {
					return <Icon type="android"/>

				}
			}
		}, {
			title: 'app',
			dataIndex: 'app_name',
			key: 'app_name',
			className:'table_entry',
			width: '500px'
		}, {
			title: 'app 版本',
			dataIndex: 'app_version',
			key: 'app_version',
			className:'table_entry',
			width: '100px'
		}, {
			title: '接入时刻',
			dataIndex: 'connect_time',
			key: 'connect_time',
			className:'table_entry',
			width: '128px',
		}, {
			title: '状态',
			dataIndex: 'connect_status',
			key: 'connect_status',
			className:'table_entry',
			width: '60px',
			render: (text, record, index) => {
				if (record.connect_status === 1)
					return <div style={{color:'#00dd00'}}>已连接</div>
				else if (record.connect_status === 2) {
					const content = (
							<div>
								<p>1. 所在网络无法联通服务端</p>
								<p>2. 无网络连接</p>
								<p>3. iOS App 切入后台</p>
								<p>4. 其他</p>
							</div>
							);
					return (
							<Popover content={content} title="App 连接异常，可能原因:">
								<div style={{color:'#F5A623'}}>断开*</div>
							</Popover>
						   )
				} else 
					return <div style={{color:'#dd0000'}}>断开</div>
			}
		}, {
			title: 'Action',
			key: 'action',
			width:'60px',
			render: (text, record, index) => {
				if (record.connect_status === 1) {
					return (
						<Button type="primary" data-key={record.did+":"+record.app_name+":"+record.app_version} onClick={this.do_connect.bind(this)}>查看详情</Button>
					)
				} else {
					return (
						<Button type="primary" disabled data-key={record.did+":"+record.app_name+":"+record.app_version} onClick={this.do_connect.bind(this)}>查看详情</Button>
					)
				}
			}
		}];
		return (
		  <div className="Entry">
			<div style={{
				width:"100%",
				backgroundColor:"#222",
				color:'#fff',
				fontSize:'20px'
			}}>
				<div style={{
					background:'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.5) 50%, rgba(255,255,255,0))',
					height:'1px'
				}}/>
				<div style={{height:'110px', fontFamily:'Lucida Grande', fontSize:'16px', color:'#ccc', display:'flex', alignItems:'center', justifyContent:'center'}}>
					AppMate, 你的应用伴侣。
				</div>
			</div>

			<div style={{maxWidth:'1000px', margin:'auto', backgroundColor:'#fff'}}>
				<div style={{
					textAlign:'center',
					fontSize:'14px',
					backgroundColor:'#d9d9d9',
					color:'#dd4b69'
				}}>
					Tips: 手机只在内网环境才能连接
				</div>
				<Table columns={columns} dataSource={this.state.session_list} />
			</div>

		  </div>
		);
	}
}

export default Entry;
