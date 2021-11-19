const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
const game = require('../gamelogic/game');
const writeTo = require('../modules/writeTo');
module.exports = {
    name: 'resume',
    description: "Resumes the game after the bot is shut down. [MODERATOR]\nArguments: (Seconds between ticks), (Delay in seconds)",
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        const gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));
        var allowedChannels = 
        [ settings.channels.mod ]
        if(!checkAllowedChannels(message, allowedChannels)){
            return;
        }

        if(!gameInfo.gameStarted) {
            message.send("No game was in progress."); return;
        }

        if(!args[0]) 
            tickTime = settings.lastTickTime;
        else {
            if(!args[0] == Number) {
                message.channel.send(`\"${args[0]}\" is not a number. Please provide a time in seconds between ticks, or type the command without an argument to use the previous amount.`);
                return;
            }
            tickTime = args[0];
        }
        if(!args[1])
            delay = 0;
        else {
            if(!args[1] == Number) {
                message.channel.send(`\"${args[1]}\" is not a number. Please provide a time in seconds to wait before resuming, or type the command without an argument to resume immediately.`);
                return;
            }
            delay = args[1];
        }

        settings.response = 'resume';
        writeTo('./settings.json', settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to start the game? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The game will start in ${delay} seconds with a time between ticks of ${tickTime}.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        settings.lastTickTime = tickTime;
        writeTo('./settings.json', settings);

        message.channel.send("Resuming game...");
        setTimeout(game.resume, delay * 1000, tickTime);
    }
}