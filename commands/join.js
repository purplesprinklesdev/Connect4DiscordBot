const fs = require('fs');
module.exports = {
    name: 'join',
    description: "Request to join a team.\nArguments: (Team to join; \"red\", \"yellow\".)",
    allowedChannels: [ 'noTeam', 'red', 'yellow' ],
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        const roles = message.member.roles;
        const red = message.guild.roles.cache.get(settings.roles.red);
        const yellow = message.guild.roles.cache.get(settings.roles.yellow);

        if(settings.teamLock){
            message.channel.send("Teams are locked! You cannot switch teams! If you believe this is a mistake, contact a moderator.");
            return;
        }

        if(args[0] === 'red'){
            if(!roles.cache.has(red.id)){
                roles.add(red);
                roles.remove(yellow);

                
                message.channel.send("You have now joined the Red Team!");
            }
            else
                message.channel.send("You are already on Red Team!");
        }
        else if(args[0] === 'yellow'){
            if(!roles.cache.has(yellow.id)){
                roles.add(yellow);
                roles.remove(red);


                message.channel.send("You have joined the Yellow Team!");
            }
            else
                message.channel.send("You are already on Yellow Team!");
        }
        else
            message.channel.send("Please choose a valid team. Example: \"!join red\" or \"!join yellow\"");
    }
}