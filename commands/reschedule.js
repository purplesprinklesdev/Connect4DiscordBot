const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const date = require('../functions/date');
const writeTo = require('../functions/writeTo');
const game = require('../game');

let delayArr = [];
let delayString = null;
module.exports = {
    name: 'reschedule',
    description: "Changes the current schedule. [MODERATOR]\nArguments: (Time & Date to start in dd/mm/yyyy-h:i:s (24 hour format))",
    allowedChannels: [ 'mod' ],
    execute(message, args) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(!settings.schedule || settings.scheduleReason == '') {
            message.channel.send("There is no current schedule.");
            return;
        }
        if(!args[0]) {
            message.channel.send("Please provide a time and date in dd/mm/yyyy-h:i:s (24 hour format).");
            return;
        }
        else {
            delayArr = date.toArray(args[0]);
            
            if(delayArr.length != 6) {
                message.channel.send(`\"${args[0]}\" is not a time. Please provide a time and date in dd/mm/yyyy-h:i:s (24 hour format).`);
                return;
            }

            delayString = date.toString(delayArr);
        }

        settings.response = 'reschedule';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to reschedule? Type \"y\" to confirm. Type \"n\" to cancel.')

        if(date.difference(date.current(), delayArr) == 0) 
            embed.setDescription(`Schedule will be changed to ${delayString}. However, it is a time in the past. The action will execute immediately.`);
        else
            embed.setDescription(`Schedule will be changed to ${delayString}.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        settings.response = '';
        settings.schedule = delayArr;
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var difference = date.difference(date.current(), settings.schedule);
        if(settings.scheduleReason == 'start')
            setTimeout(game.start, difference * 1000, settings.lastTickTime, message.guild);
        else if(settings.scheduleReason == 'tick') 
            setTimeout(game.resume, difference * 1000, settings.lastTickTime, message.guild);

        message.channel.send("Schedule changed.");
    }
}