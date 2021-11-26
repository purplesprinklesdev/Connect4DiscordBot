const fs = require('fs');
const writeTo = require('../functions/writeTo');
module.exports = {
    name: 'pingeveryone',
    description: "Toggles if the bot will ping everyone [MODERATOR]",
    allowedChannels: [ 'mod' ],
    execute(message){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if (settings.pingEveryone) {
            settings.pingEveryone = false;
            message.channel.send("The bot will now not ping everyone.");
        }
        else {
            settings.pingEveryone = true;
            message.channel.send("The bot will now ping everyone.");
        }
        writeTo(`./settings/${message.guild.id}.json`, settings);
    }
}