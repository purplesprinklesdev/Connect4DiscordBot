const fs = require('fs');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
module.exports = {
    name: 'move',
    description: "Move a user to the other team. [MODERATOR]\nArguments: (User ID)",
    async execute(message, args){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        var allowedChannels = 
        [ settings.channels.mod ]
        if(!checkAllowedChannels(message, allowedChannels))
            return;

        if(!args[0]) {
            message.channel.send("Please provide a valid user ID. To get user ID's, follow this guide: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-");
            return;
        }

        if (parseFloat(args[0]) === NaN) {
            message.channel.send("Please provide a valid user ID. To get user ID's, follow this guide: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-");
            return;
        }

        const member = await message.guild.members.cache.get(args[0]);
        if (member == undefined) {
            message.channel.send("Could not find user. Double check you are using the correct ID. To get user ID's, follow this guide: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-");
            return;
        }

        const red = message.guild.roles.cache.get(settings.roles.red);
        const yellow = message.guild.roles.cache.get(settings.roles.yellow);
        if (member.roles.cache.has(red.id)) {
            member.roles.remove(red);
            member.roles.add(yellow);

            message.channel.send(`User ${member.nickname} has been moved to the Yellow Team.`);
        }
        else if (member.roles.cache.has(yellow.id)) {
            member.roles.remove(yellow);
            member.roles.add(red);

            message.channel.send(`User ${member.nickname} has been moved to the Red Team.`);
        }
        else
            message.channel.send(`User ${member.nickname} is not on a team!`);
        
    }
}