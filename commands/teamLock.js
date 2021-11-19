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
        if(!checkAllowedChannels(message, allowedChannels)){
            return;
        }

        const author = message.member;
        let botMod = message.guild.roles.cache.find((role) => role.name === "BotMod")

        if(author.roles.cache.has(botMod.id)){
            const settings = JSON.parse(fs.readFileSync('./settings.json'));
            if(settings.teamLock){
                settings.teamLock = false;
                message.channel.send("Teams have been unlocked!");
            }
            else{
                settings.teamLock = true;
                message.channel.send("Teams have been locked!");
            }
            writeTo('./settings.json', settings);
        }
        else{
            message.channel.send("You do not have sufficient permissions to execute this command.");
        }
    }
}