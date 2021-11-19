const fs = require('fs');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
module.exports = {
    name: 'team',
    description: "Get your current team",
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        var allowedChannels = 
        [ settings.channels.noTeam, settings.channels.red, settings.channels.yellow, settings.channels.mod ]
        if(!checkAllowedChannels(message, allowedChannels)){
            return;
        }

        const author = message.member;
        let red = message.guild.roles.cache.find((role) => role.name === "Red")
        let yellow = message.guild.roles.cache.find((role) => role.name === "Yellow")

        var currentTeam;

        if(author.roles.cache.has(red.id)){
            currentTeam = 'Red';
        }
        else if(author.roles.cache.has(yellow.id)){
            currentTeam = 'Yellow';
        }
        else{
            message.channel.send("You are not currently on any team. Use !join to join one.")
            return;
        }
        message.channel.send(`You are on the ${currentTeam} Team.`);
    }
}