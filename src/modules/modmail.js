const Parse = require("../util/parse.js");
const Embed = require("../util/embed.js");
const DataManager = require("../util/datamanager.js");
const Router = require("../util/router.js");

class ModMail extends Parse {
	constructor(message) {
		super(message);
		this.mchannel = this.server ? this.Search.channels.get(this.server.channels.modmail) : null;
	}

	get modmail () {
		let reactionmessages = this.reactionmessages;
		return reactionmessages.modmail || {};
	}
	
	set modmail (modmail) {
		this.reactionmessages.modmail = modmail;
		DataManager.setServer(this.reactionmessages, "./src/data/reactionmessages.json");
	}

	get output() {
		let outputConstructor = require("./output.js");
		return new outputConstructor(this.message);
	}

	setData(modmail) {
		this.reactionmessages.modmail = modmail;
		DataManager.setServer(this.reactionmessages, "./src/data/reactionmessages.json");
	}

	async log(data) {
		try {
			let args = [];
			if (data.content) args.unshift(data.content);
			if (data.mod && data.user) args.unshift(data.user.tag);
			if (data.mod && data.users) args.unshift(...data.users.map(user => user.tag));
			if (data.mod && /reply|send/.test(data.command)) args.unshift(data.mod.flair ? "server" : "self");
			Router.logCommand({
				"author": data.mod ? data.mod : data.user,
				"args": args,
				"command": data.command
			}, {
				"file": "Mod Mail",
				"prefix": ""
			})
		} catch (e) {
			if (e) this.Output.onError("log " + e);
		}
	}

	async sort(data) {  //find the relevant modmil
		try {
			let f = Object.entries(this.modmail).find(([i, m]) => {
				if (i.startsWith("_")) return false;
				if (m.tag !== data.user.tag) return false;
				if (m.overflow) return false;
				return true;
			});
			if (!f) return await this.output.anew(data);
      let [id, mailInfo] = f;
			let modmail = await this.mchannel.fetchMessage(id)
				.catch(async () => {
					let user = data.mod || data.user;
					await this.Output.confirm({ //if couldn't find the message
						"channel": this.mchannel,
						"description": "**" + user.tag + "** Couldn't find message. Please confirm that message no longer exists.",
						"role": "admin"
					});
					delete this.modmail[id]; //and delete the record
					this.setData(this.modmail);
					await this.output.anew(data); //and make a new post
					throw "";
				}); //so if they have a chat history, find it
			data = Object.assign(data, {
				"message": modmail,
				"embed": Embed.receiver(modmail.embeds[0])
			});
			if (Date.now() - mailInfo.lastMail < 1800000 && !data.mod && data.embed.fields[data.embed.fields.length - 1].name.includes("user wrote:")) await this.output.append(data);
			else await this.output.renew(data);
		} catch (e) {
			if (e) this.Output.onError(e);
			throw e;
		}
	}

}

module.exports = ModMail;