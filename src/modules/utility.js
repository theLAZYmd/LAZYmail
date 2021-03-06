const Parse = require("../util/parse.js");
const Embed = require("../util/embed.js");

class Utility extends Parse { //fairly miscelanneous functions

  async ping () {
    this.Output.generic(`** ${this.author.tag}** :ping_pong: ${parseInt(this.client.ping)}ms`);  
  }
  
  async uptime () {
    let time = Date.getTime(Date.now() - this.client.readyTimestamp);
    return this.Output.generic(`**${time.days}** days, **${time.hours}** hours, **${time.minutes}** minutes, and **${time.seconds}** seconds since ${Math.random() > 0.5 ? "**bleep bloop! It's showtime**" : "last reboot"}.`);
  }

  async markdownify () {
    try {
      let msg = await this.find();
      if (!msg.content) throw "No embeds found to JSONify!";
      this.Output.data(msg.content, this.channel, "md");
    } catch(e) {
      if (e) this.Output.onError(e);
    }
  }

  async jsonify () {
    try {
      let msg = await this.find();
      if (!msg.embed) throw "No embeds found to JSONify!";
      this.Output.data(msg.embed);
    } catch(e) {
      if (e) this.Output.onError(e);
    }
  }

  find (args = this.args) { //function needs a channel input
    return new Promise ((resolve, reject) => {
      let id = args[0], channel = this.channel;
      if (args.length === 2) {
        channel = this.Search.channels.get(args[1]);
        if (!channel) return reject("No such channel!");
      } //if second argument provided, that's the channel to look in
	    channel.fetchMessage(id)
      .then(msg => {
        if (msg.embeds && msg.embeds[0]) msg.embed = Embed.receiver(msg.embeds[0]);
        return resolve(msg);
      })
      .catch(e => reject(e)); //if no message found, say so
    })
  }

}

module.exports = Utility;