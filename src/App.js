import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { browserHistory } from 'react-router';


class App extends Component {

	handle_click_top_bar(e) {
		browserHistory.push('/');
	}

	render() {
		return (
			<div className="App" style={{
			  backgroundColor:'#fff'
			}}>
				<div className="top_bar" style={{
					width:"100%",
					backgroundColor:"#222",
					color:'#fff',
					fontSize:'20px',
					paddingTop:'15px',
					paddingBottom:'5px',
					textAlign:'center'
				}} onClick={this.handle_click_top_bar.bind(this)}>
					<img alt='logo' src='/resource/comming_logo.png' width='32px'/>
				</div>

				<div style={{minHeight:'550px'}}>
					{this.props.children}
				</div>	

				<div style={{paddingTop:'40px', paddingBottom:'20px'}}>
					<div style={{height:'1px', backgroundColor:'#eee', maxWidth:'1000px', margin:'auto'}} />
					<div style={{marginTop:'10px', justifyContent:'center', alignItems:'center', color:'#888', fontSize:'12px'}}>
						@YourCompany.com
					</div>
				</div>
			</div>
		);
	}
}

export default App;
