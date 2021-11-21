const DiscordJS = require('discord.js');
const fs = require('fs');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
const writeTo = require('../modules/writeTo');
module.exports = {
    name: 'teamlock',
    description: "Lock the teams so no one can switch. [MODERATOR]",
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        var allowedChannels = 
        [ settings.channels.mod ]
        if(!checkAllowedChannels(message, allowedChannels))
            return;

        if (settings.teamLock) {
            settings.teamLock = false;
            message.channel.send("Teams have been unlocked!");
        }
        else {
            settings.teamLock = true;
            message.channel.send("Teams have been locked!");
        }
        writeTo('./settings.json', settings);
    }
}