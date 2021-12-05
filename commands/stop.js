const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const writeTo = require('../functions/writeTo');
module.exports = {
    name: 'stop',
    description: "Stops the game. [MODERATOR]",
    allowedChannels: [ 'mod' ],
    execute(message, args){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(!settings.gameStarted || settings.schedule == null) {
            message.channel.send("There is no current game to stop."); return;
        }

        settings.response = 'stop';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to stop the game? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The game will stop immediately.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message) {
        message.channel.send("Stopping game");
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        
        settings.response = '';
        settings.gameStarted = false;
        settings.schedule = null;
        settings.scheduleReason = '';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var gameChannel = message.guild.channels.cache.get(settings.channels.gameOutput);
        gameChannel.send("Game has been stopped prematurely by a moderator.");
    }
}