const DataManager = require("./datamanager.js");
const Permissions = require("./permissions.js");

class Parse {

	constructor(message) { //everything extends to here
		this.message = message;
		if (typeof this.message === "object") {
			//let guild = this.guild;
			//let server = this.server; //to prevent overuse of this keyword
			let content = (this.message.content || "").replace("’", "'")
				.replace("…", "...")
				.replace("—", "--")
				.replace("“", "\"")
				.replace("”", "\"")
				.replace(/[\u200B-\u200D\uFEFF]/g, ''); /*
			if (server)
				for (let [key, alias] of guild ? Aliases._all.concat(Aliases[guild.id] || []) : Aliases.all)
					if (content.toLowerCase().includes(key.toLowerCase()))
						content = content.replace(key, alias.replace(/\${([a-z]+)}/gi, value => server.prefixes[value.match(/[a-z]+/i)]));*/
			this.message.content = content || "";
		}
	}

	//DATA

	get server() {
		if (!this._server) {
			if (this.guild) this._server = DataManager.getServer(this.guild.id);
		}
		return this._server || "";
	}

	get reactionmessages() {
		if (!this._reactionmessages) {
			if (this.guild) this._reactionmessages = DataManager.getServer(this.guild.id, "./src/data/reactionmessages.json");
		}
		return this._reactionmessages || {};
	}

	set reactionmessages(reactionmessages) {
		DataManager.setServer(reactionmessages, "./src/data/reactionmessages.json");
		this._reactionmessages = reactionmessages;
	}

	//Methods

	get Output() {
		if (!this._Output) {
			let OutputConstructor = require("./output.js");
			this._Output = new OutputConstructor(this.message);
		}
		return this._Output;
	}

	get Permissions() {
		if (!this._Permissions) this._Permissions = Permissions;
		return this._Permissions;
	}

	get Paginator() {
		if (!this._Paginator) {
			let PaginatorConstructor = require("../modules/paginator");
			this._Paginator = new PaginatorConstructor(this.message);
		}
		return this._Paginator;
	}

	get Search() {
		let SearchConstructor = require("./search.js");
		return new SearchConstructor(this.message);
	}

	get Check() {
		if (!this._Check) {
			let CheckConstructor = require("./check.js");
			return new CheckConstructor(this.message);
		}
		return this._Check;
	}

	//argsInfo

	get client() {
		if (this._client) return this._client;
		return this._client = this.message ? this.message.client : null;
	}

	get member() {
		if (this._member) return this._member;
		return this._member = this.message ? this.message.member : null;
	}

	set member(value) {
		this._member = value;
	}

	get guild() {
		if (this._guild) return this._guild;
		if (!this._guild && this.member) this._guild = this.member.guild;
		if (!this._guild && this.message) this._guild = this.message.guild || this.message._guild;
		return this._guild || null;
	}

	set guild(value) {
		this._guild = value;
	}

	get author() {
		if (this._author) return this._author;
		return this.message ? this._author = this.message.author : null;
	}

	get channel() {
		if (this._channel) return this._channel;
		return this.message ? this._channel = this.message.channel : null;
	}

	get user() {
		if (this._user) return this._user;
		return this._user = this.member ? this.member.user : null;
	}

	set user(value) {
		this._user = value;
	}

	get prefix() {
		if (this._prefix) return this._prefix;
		let prefixes = this.server ? this.server.prefixes : {
			"generic": "!",
			"nadeko": "."
		};
		for (let prefix of Object.values(prefixes))
			if (this.message.content.startsWith(prefix))
				return this._prefix = prefix;
		return "";
	}

	get words() {
		if (this._words) return this._words;
		return this._words = this.message.content.slice(this.prefix.length).match(/[^\s]+/gi) || [];
	}

	get command() {
		if (this._command) return this._command;
		return this._command = this.words.length > 0 ? this.words[0] : "";
	}

	get args() {
		if (this._args) return this._args;
		return this._args = this.words.length > 0 ? this.words.slice(1) : [];
	}

	get argument() {
		if (this._argument) return this._argument;
		return this._argument = this.args.join(" ") || "";
	}

	get embed() {
		if (this._embed) return this._embed;
		return this.message && this.message.embeds ? this.message.embeds[0] : null;
	}

}

module.exports = Parse;