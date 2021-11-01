const DiscordJS = require('discord.js');
const fs = require('fs');
module.exports = {
    name: 'teamLock',
    description: "Lock the teams so no one can switch",
    execute(message, args){
        const author = message.member;
        let botMod = message.guild.roles.cache.find((role) => role.name === "BotMod")

        if(author.roles.cache.has(botMod.id)){
            const settings = JSON.parse(fs.readFileSync('./settings.json'));
            if(settings.teamLock){
                settings.teamLock = false;
                message.channel.send("Teams have been unlocked!")
            }
            else{
                settings.teamLock = true;
                message.channel.send("Teams have been locked!")
            }
            var stringSettings = JSON.stringify(settings);
            fs.writeFile('./settings.json', stringSettings);
        }
        else{
            message.channel.send("You do not have sufficient permissions to execute this command.");
        }
    }
}