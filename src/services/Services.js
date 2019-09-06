import baseConfig from '../config/config';
import {EventEmitter} from 'fbemitter';
import Web3 from 'web3';

import StorageService from './StorageService';
//import ENSLoginSDK from '@enslogin/sdk';
import ENSLoginSDK from '@enslogin/sdk/dist/ENSLoginSDK'

class Services
{
	constructor(config = baseConfig, overrides = {})
	{
		this.config         = config;
		this.emitter        = new EventEmitter();
		this.provider       = null;
		this.web3           = null;
		this.storageService = overrides.storageService || new StorageService();
	}

	start()
	{
		this.config.__callbacks = {
			resolved: (username, addr, descr) => {
				this.emitter.emit('setView', 'Loading');
			},
			loading: (protocol, path) => {
				// this.emitter.emit('Notify', 'info', `Loading ${protocol}://${path} ...`);
				console.info(`Loading ${protocol}://${path} ...`);
			},
			loaded: (protocol, path) => {
				// this.emitter.emit('Notify', 'info', `${protocol}://${path} loaded`);
				console.info(`${protocol}://${path} loaded`);
			}
		};
		this.storageService.getIdentity().then(username => {
			this.tryConnect(username);
		});
	}

	stop()
	{
	}

	tryConnect(username)
	{
		ENSLoginSDK.connect(username, this.config)
		.then(async (provider) => {
			this.provider = provider;
			this.web3     = new Web3(provider);
			try
			{
				this.provider.enable()
				.then(() => {
					this.storageService.storeIdentity(username)
					this.emitter.emit("Notify", "info", `You are connected to ${username}`)
					this.emitter.emit('setView', 'Main');
				})
				.catch(() => {
					this.emitter.emit("Notify", "error", "Connection refused")
					this.emitter.emit('setView', 'Login');
				});
			}
			catch (e)
			{
				this.storageService.storeIdentity(username)
				this.emitter.emit("Notify", "info", `You are connected to ${username}`)
				this.emitter.emit('setView', 'Main');
			}
		})
		.catch(e => {
			this.storageService.storeIdentity(undefined);
		})
	}



	disconnect()
	{
		if (this.provider.disable)
		{
			this.provider.disable();
		}
		this.provider = null;
		this.web3     = null;
		this.storageService.storeIdentity(undefined);
		this.emitter.emit("Notify", "warning", `Disconnected`)
		this.emitter.emit('setView', 'Login');
	}

}

export default Services;
