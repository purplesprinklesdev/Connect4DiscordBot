const DiscordJS = require('discord.js');
module.exports = {
    name: 'team',
    description: "Get your current team",
    execute(message, args){
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