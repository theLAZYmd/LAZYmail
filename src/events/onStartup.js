const commands = require("../commands/message.json");
const config = require("../config.json");
const DataManager = require("../util/datamanager.js");
const Package = require("../../package.json");

class onStartup {

	constructor(client) {
		this.client = client;
	}

	get reboot() {
		return this.client.readyTimestamp;
	}

	get commands() {
		let commandlist = {};
		for (let cmdInfo of commands) {
			for (let alias of cmdInfo.aliases) {
				commandlist[alias.toLowerCase()] = true;
			}
		}
		return commandlist;
	}

	async guilds() {
		for (let guild of Array.from(this.client.guilds.values()))
			console.log(`Loaded client server ${guild.name} in ${Date.now() - this.reboot}ms`);
	}

	async owners() {
		let owners = config.ids.owner.map(owner => this.client.users.get(owner)) || "";
		for (let owner of owners)
			console.log(owner ? `Noticed bot owner ${owner.tag} in ${Date.now() - this.reboot}ms` : "");
	}

	async setPresence() {
		let name = "DM me for help || !h";
		this.client.user.setPresence({
			"game": {
				name,
				"type": "PLAYING"
			}
		});
		console.log(`Set bot user presence to ${name} in ${Date.now() - this.reboot}ms.`);
	}

	async setUsername() {
		let version = Package.version.match(/[0-9]+.[0-9]+.[0-9]/);
		if (!version) throw console.log("Invalid versioning in package.json, please review.");
		for (let guild of Array.from(this.client.guilds.values())) {
			let name = `${Package.name}${this.client.user.id === config.ids.betabot ? "beta" : ""} v.` + version;
			if (guild.me.nickname !== name) {
				await guild.me.setNickname(name);
				console.log(`Set bot nickname to ${name} in guild ${guild.name} in ${Date.now() - this.reboot}ms.`);
			}
		}
	}

}

module.exports = onStartup;