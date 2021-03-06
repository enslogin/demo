import React, { Component } from "react";
import {EventEmitter} from 'fbemitter';
import Web3 from 'web3';

import LoginWithEthereum from '@enslogin/login-with-ethereum';

import Notifications from './Notifications';
import Loading       from './Loading';
import Main          from './Main';
import config        from '../config/config';

class App extends Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			loading: false,
			provider: null,
			web3: null,
			emitter: new EventEmitter(),
			config: {
				...config,
				__callbacks:
				{
					resolved: (username, addr, descr) => {
						console.info(`Resolved ${username} (${addr}) ${descr}`);
						this.setState({ loading: true })
					},
					loading: (protocol, path) => {
						console.info(`Loading ${protocol}://${path} ...`);
						this.setState({ loading: true })
					},
					loaded: (protocol, path) => {
						console.info(`${protocol}://${path} loaded`);
						this.setState({ loading: true })
					}
				}
			}
		}
	}

	connect = (provider) => {
		this.state.emitter.emit("Notify", "info", `You are connected`)
		this.setState({
			provider,
			web3: new Web3(provider),
			loading: false,
		})
	}

	disconnect = () => {
		this.state.emitter.emit("Notify", "info", `You are disconnect`)
		this.setState({
			provider: null,
			web3: null,
		})
	}

	render = () => {
		return (
			<>
				{ this.state.loading && <Loading/> }
				<Notifications emitter={this.state.emitter}/>
				<LoginWithEthereum
					config = { this.state.config }
					connect = { this.connect }
					disconnect = { this.disconnect }
					noInjected
				/>
				{ this.state.provider && <Main services={this.state}/> }
			</>
		);
	}
}

export default App;
