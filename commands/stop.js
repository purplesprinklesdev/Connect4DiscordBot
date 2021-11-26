const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const writeTo = require('../functions/writeTo');
const date = require('../functions/date');

let delayArr;
let delayString;
module.exports = {
    name: 'stop',
    description: "Stops the game. [MODERATOR]\nArguments: (Delay in seconds)",
    allowedChannels: [ 'mod' ],
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(!settings.gameStarted) {
            message.channel.send("There is no current game to stop."); return;
        }

        if(!args[0]) {
            delayArr = date.current();
            delayString = date.toString(delayArr);
        }
        else {
            delayArr = date.toArray(args[1]);

            if(delayArr.length != 6) {
                message.channel.send(`\"${args[1]}\" is not a time. Please provide a time and date in dd/mm/yyyy h:i:s (24 hour format), or type the command without an argument to stop immediately.`);
                return;
            }

            delayString = date.toString(delayArr);
        }
        settings.response = 'stop';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to stop the game? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The game will stop at ${delayString}`);

        message.channel.send({ embeds:[embed] });
    },
    response(message) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        settings.schedule = delayArr;
        settings.scheduleReason = 'stop';
        settings.response = '';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        message.channel.send("Stopping game");
        var difference = date.difference(date.current(), delayArr);
        if(difference < 0)
            difference = 0;
        setTimeout(function() {
            settings.gameStarted = false;
            settings.schedule = null;
            settings.scheduleReason = '';
            writeTo(`./settings/${message.guild.id}.json`, settings);
            var gameChannel = message.guild.channels.cache.get(settings.channels.gameOutput);
            gameChannel.send("Game has been stopped prematurely by a moderator.");
        }, difference * 1000);
    }
}