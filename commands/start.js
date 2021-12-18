const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const writeTo = require('../functions/writeTo');
const date = require('../functions/date');
const game = require('../game');
const timers = require('../functions/timers');

let tickTime;
let delayString;
let delayArr;
module.exports = {
    name: 'start',
    description: "Starts the game. [MODERATOR]\nArguments: (Seconds between ticks), (Time & Date to start in dd/mm/yyyy-h:i:s (24 hour format))",
    allowedChannels: [ 'mod' ],
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(settings.gameStarted) {
            message.channel.send("You must end the current game before you can start a new one. Use !stop.");
            return;
        }
            
        if(!args[0]) 
            tickTime = 86400;
        else {
            if(!args[0] == Number) {
                message.channel.send(`\"${args[0]}\" is not a number. Please provide a time in seconds between ticks, or type the command without an argument to use the default.`);
                return;
            }
            tickTime = args[0];
        }

        if(!args[1]) {
            delayArr = date.current();
            delayString = date.toString(delayArr);
        }
        else {
            delayArr = date.toArray(args[1]);
            
            if(delayArr.length != 6) {
                message.channel.send(`\"${args[1]}\" is not a time. Please provide a time and date in dd/mm/yyyy-h:i:s (24 hour format), or type the command without an argument to start immediately.`);
                return;
            }

            delayString = date.toString(delayArr);
        }

        settings.response = 'start';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to start the game? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The game will start at ${delayString} with a time between ticks of ${tickTime} seconds.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        settings.response = '';
        settings.lastTickTime = tickTime;
        settings.schedule = delayArr;
        settings.scheduleReason = 'start';
        writeTo(`./settings/${message.guild.id}.json`, settings, 'start');

        message.channel.send("Starting game...");
        timers.add(message.guild.id, setTimeout(game.start, date.difference(date.current(), delayArr) * 1000, tickTime, message.guild));
    }
}