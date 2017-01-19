import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
import React, { Component } from 'react';
import { browserHistory } from 'react-router';

var core_info = require('../core_info').core_info;

class Sider extends Component{
  constructor() {
    super(...arguments);

    this.session_id = this.props.session_id;
    var path = this.props.currentPath.split("/").pop()
		this.state = {
			current: path,
			connect_status: 1
		};
	}
	componentDidMount() {
		core_info.addObserver('sider', (current_session_info, session_list) => {
			this.setState({connect_status: current_session_info.connect_status});
		});
		core_info.change_current_session_id(this.session_id);
	}

	componentWillUnmount() {
		core_info.removeObserver('sider');
	}

  handleClick(e) {
    switch(e.key){
      case "hotfix":
        browserHistory.push('/dashboard/hotfix?session_id='+this.session_id)
        break;
      case "sandbox":
        browserHistory.push('/dashboard/sandbox?session_id='+this.session_id)
        break;
      case "log":
        browserHistory.push('/dashboard/log?session_id='+this.session_id)
        break;
      default:
        break;
    }
    this.setState({
      current: e.key,
    });
  }

  render() {
	var menu = (
      <Menu onClick={this.handleClick.bind(this)}
        style={{ width: 240, textAlign:'left' }}
        defaultOpenKeys={['hack_tech_sub', 'perf_sub']}
        selectedKeys={[this.state.current]}
        mode="inline"
        theme="light" >
        <Menu.Item key="log"><span><Icon type="message" />实时日志</span></Menu.Item>
        <SubMenu key="hack_tech_sub" title={<span><Icon type="appstore" /><span>效率工具</span></span>}>
			     <Menu.Item key="hotfix">Hotfix(Only iOS)</Menu.Item>
			     <Menu.Item key="sandbox">SandBox(Only iOS)</Menu.Item>
		</SubMenu>
      </Menu>
	);
	if (this.state.connect_status !== 1) {
		menu = (
			<Menu onClick={this.handleClick.bind(this)}
			style={{ width: 240, textAlign:'left' }}
			defaultOpenKeys={['hack_tech_sub', 'perf_sub']}
			selectedKeys={[this.state.current]}
			mode="inline"
			theme="light" >
			<Menu.Item disabled key="log"><span><Icon type="message" />实时Log</span></Menu.Item>
			<SubMenu key="hack_tech_sub" title={<span><Icon type="appstore" /><span>效率工具</span></span>}>
				<Menu.Item disabled key="hotfix">Hotfix(Only iOS)</Menu.Item>
				<Menu.Item disabled key="sandbox">SandBox(Only iOS)</Menu.Item>
			</SubMenu>
		</Menu>
		);
	}
    return (
		menu
    );
  }
}
module.exports = Sider;
