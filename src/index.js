import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, IndexRedirect} from 'react-router';
import App from './App';
import Entry from './Entry';
import Dashboard from './Dashboard';
import Hotfix from './components/Hotfix';
import Log from './components/Log';
import SandBox from './components/SandBox';
import './index.css';

render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRedirect to="/entry" />
			<Route path="/entry" component={Entry} />
			<Route path="/dashboard" component={Dashboard} >
				<IndexRedirect to="/dashboard/log" />
				<Route path="hotfix" component={Hotfix} />
				<Route path="log" component={Log} />
				<Route path="sandbox" component={SandBox} />
			</Route>
		</Route>
	</Router>
), document.getElementById('root'));

