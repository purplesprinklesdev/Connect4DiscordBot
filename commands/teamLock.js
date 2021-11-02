const DiscordJS = require('discord.js');
const fs = require('fs');
module.exports = {
    name: 'teamlock',
    description: "Lock the teams so no one can switch",
    execute(message, args){
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
            var stringSettings = JSON.stringify(settings);
            fs.writeFile('./settings.json', stringSettings, function(err){
                if(err){
                    console.log(err)
                    message.channel.send("WARNING: Failed to write to JSON, changes not saved!")
                }
            });
        }
        else{
            message.channel.send("You do not have sufficient permissions to execute this command.");
        }
    }
}