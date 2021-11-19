const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
const game = require('../gamelogic/game');
const writeTo = require('../modules/writeTo');

let tickTime;
let delay;
module.exports = {
    name: 'start',
    description: "Starts the game. [MODERATOR]\nArguments: (Seconds between ticks), (Delay in seconds)",
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        const gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));
        var allowedChannels = 
        [ settings.channels.mod ]
        if(!checkAllowedChannels(message, allowedChannels))
            return;

        if(gameInfo.gameStarted) {
            message.channel.send("You must end the current game before you can start a new one. Use !stop."); return;
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
        if(!args[1])
            delay = 0;
        else {
            if(!args[1] == Number) {
                message.channel.send(`\"${args[1]}\" is not a number. Please provide a time in seconds to wait before starting, or type the command without an argument to start immediately.`);
                return;
            }
            delay = args[1];
        }

        settings.response = 'start';
        writeTo('./settings.json', settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to start the game? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The game will start in ${delay} seconds with a time between ticks of ${tickTime} seconds.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message){
        message.channel.send("Starting game...");
        setTimeout(game.start, delay * 1000, tickTime);
    }
}