const DiscordJS = require('discord.js');
const fs = require('fs');
module.exports = {
    name: 'join',
    description: "Request to join a team",
    execute(message, args){
        const author = message.member;
        let red = message.guild.roles.cache.find((role) => role.name === "Red")
        let yellow = message.guild.roles.cache.find((role) => role.name === "Yellow")

        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        if(settings.teamLock){
            message.channel.send("Teams are locked! You cannot switch teams! If you believe this is a mistake, contact a moderator.");
            return;
        }

        if(args[0] === 'red'){
            if(!author.roles.cache.has(red.id)){
                author.roles.add(red);
                author.roles.remove(yellow);

                
                message.channel.send("You have now joined the Red Team!");
            }
            else{
                message.channel.send("You are already on Red Team!");
            }
        }
        else if(args[0] === 'yellow'){
            if(!author.roles.cache.has(yellow.id)){
                author.roles.add(yellow);
                author.roles.remove(red);


                message.channel.send("You have joined the Yellow Team!");
            }
            else{
                message.channel.send("You are already on Yellow Team!");
            }
        }
        else{
            message.channel.send(
                "Please choose a valid team. Example: \"!join red\" or \"!join yellow\""
                );
        }
    }
}