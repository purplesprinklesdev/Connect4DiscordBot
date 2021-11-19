const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
const game = require('../gamelogic/game');
const writeTo = require('../modules/writeTo');

let delay;
module.exports = {
    name: 'stop',
    description: "Stops the game. [MODERATOR]\nArguments: (Delay in seconds)",
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        const gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));
        var allowedChannels = 
        [ settings.channels.mod ]
        if(!checkAllowedChannels(message, allowedChannels))
            return;

        if(!gameInfo.gameStarted) {
            message.channel.send("There is no current game to stop."); return;
        }

        if(!args[0])
            delay = 0;
        
        else {
            if(!args[0] == Number) 
                message.channel.send(`\"${args[0]}\" is not a number. Please provide a time in seconds to wait before stopping, or type the command without an argument to stop immediately.`);
            else 
                delay = args[0];
        }
        settings.response = 'stop';
        writeTo('./settings.json', settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to stop the game? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The game will stop in ${delay} seconds.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message) {
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        if(delay === 0) {
            message.channel.send("Stopping game");
            game.stop();

            var gameChannel = message.guild.channels.cache.get(settings.channels.gameOutput);
            gameChannel.send("Game has been stopped prematurely by a moderator.");
        }
        else {
            message.channel.send(`Stopping game in ${delay} seconds.`);
            setTimeout(game.stop, delay * 1000);

            var gameChannel = message.guild.channels.cache.get(settings.channels.gameOutput);
            setTimeout(function() {
                gameChannel.send("Game has been stopped prematurely by a moderator.");
            }, delay * 1000)
        }
    }
}