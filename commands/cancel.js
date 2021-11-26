const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const writeTo = require('../functions/writeTo');
const date = require('../functions/date');
module.exports = {
    name: 'cancel',
    description: "Cancels the currently scheduled action. [MODERATOR]",
    allowedChannels: [ 'mod' ],
    execute(message){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(!settings.schedule) {
            message.send("No schedule to cancel!"); return;
        }

        settings.response = 'cancel';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to cancel the current schedule? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription(`The ${settings.scheduleReason} action set to occur at ${date.toString(settings.schedule)} will be cancelled.`);

        message.channel.send({ embeds:[embed] });
    },
    response(message){
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        settings.response = '';
        settings.schedule = null;
        settings.scheduleReason = '';
        writeTo(`./settings/${message.guild.id}.json`, settings);

        message.channel.send("Schedule cancelled.");
    }
}