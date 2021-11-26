const fs = require('fs');
const writeTo = require('../functions/writeTo');
module.exports = {
    name: 'teamlock',
    description: "Lock the teams so no one can switch. [MODERATOR]",
    allowedChannels: [ 'mod' ],
    execute(message){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        if (settings.teamLock) {
            settings.teamLock = false;
            message.channel.send("Teams have been unlocked!");
        }
        else {
            settings.teamLock = true;
            message.channel.send("Teams have been locked!");
        }
        writeTo(`./settings/${message.guild.id}.json`, settings);
    }
}