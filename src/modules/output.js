const Main = require("./modmail.js");
const Embed = require("../util/embed.js");

class Output extends Main {

	constructor(message) {
		super(message);
	}

	async send(data) {
		try {
			this.Output.sender(new Embed()
				.setTitle(data.title ? data.title : "New mail from " + (data.mod.flair ? "server " : data.mod.tag + " via ") + this.guild.name + ":")
				.setDescription(data.content)
			, data.user);
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

	async anew(data = {}) { //called for any new modmail conversation
		try {
			let member = this.Search.members.byUser(data.user);
			let embed = new Embed()
				.setTitle("ModMail Conversation for " + data.user.tag)
				.setDescription("User " + data.user + " has **" + Math.max(0, (member.roles.size - 1)) + "** roles.\n" +
				Embed.getFields([
				["Joined Discord", Date.getISOtime(data.user.createdTimestamp).slice(4, 15)],
				["Joined " + this.guild.name, Date.getISOtime(member.joinedTimestamp).slice(4, 15)]
				]), );
			let bold = true;
			if (data.embed && data.embed.fields) embed.fields = data.embed.fields.slice(-1);
			this.renew(Object.assign({	embed, bold }, data));
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

	async append(data) { // Adds to last field. Called for a reply where the previous messages sent by the user was in the last half an hour.
		try {
			data.embed.fields[data.embed.fields.length - 1].value += "\n" + data.content;
			this.editor(data); //and if they had last message, less than half an hour ago, merely append it with new line
			this.modmail[data.message.id].lastMail = Date.now();
			this.setData(this.modmail);
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

	async amend(data) { //called for a reply, adds a new field to the last message
		try {
			let name = "On " + Date.getISOtime(Date.now()) + ", " + data.mod.tag + (data.mod.flair ? " 🗣" : "") + " wrote:";
			data.embed.addField(name, data.content, false);
			this.editor(data); //and if they had last message, less than half an hour ago, merely append it with new line
			if (!data.mod) this.modmail[data.message.id].lastMail = Date.now();
			this.setData(this.modmail);
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

	async moderate(data) { //adds a moderator message as a new field. Edits to do so.
		try {
			data.embed.addField(data.name, "", false);
			this.editor(data); //and if they had last message, less than half an hour ago, merely append it with new line
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

	async renew(data) { //resposts conversation with new field added. Deletes old one.
		try {
			let name = "On " + Date.getISOtime(Date.now()) + ", ";
			if (!data.mod) name += "user";
			else name += data.mod.tag + (data.mod.flair ? " 🗣" : "");
			name += " wrote:";
			data.embed.addField(name, data.content, false);
			let modmail = await this.Output.reactor(data.embed, this.mchannel, ["❎", "🗣", "👤", "❗", "⏲"]);
			if (data.message && this.modmail[data.message.id]) {
				data.message.delete();
				this.modmail[modmail.id] = this.modmail[data.message.id];
				if (!data.mod) this.modmail[modmail.id].lastMail = Date.now();
				delete this.modmail[data.message.id];
			} else this.modmail[modmail.id] = {
				"tag": data.user.tag,
				"lastMail": Date.now()
			};
			this.setData(this.modmail);
			return modmail;
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

	async editor(data) { //check if the edited message is too long
		try {
			data.embed.setDescription("User " + data.user + " has **" + Math.max(0, (member.roles.size - 1)) + "** roles.\n" +
				Embed.getFields([
					["Joined Discord", Date.getISOtime(data.user.createdTimestamp).slice(4, 15)],
					["Joined " + this.guild.name, Date.getISOtime(member.joinedTimestamp).slice(4, 15)]
				]),
			);
			if (data.embed.fields.length < 26) return await this.Output.editor(data.embed, data.message); //check if the message would be more than 2000 characters
			data.message.clearReactions(); //clear reactions from the old message
			this.modmail[message.id].overflow = msg.id; //set the overflow to true
			this.setData(this.modmail);
			return await this.anew(data);
		} catch (e) {
			if (e) this.Output.onError(e);
		}
	}

}

module.exports = Output;