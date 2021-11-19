const { MessageEmbed } = require('discord.js');
module.exports = function (guild, _channel, pingEveryone, color, title, description, footer){
    const newEmbed = new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setDescription(description);

    if(footer){
        newEmbed.setFooter(footer);
    }
    let mention = '';
    if(pingEveryone) {
        mention = '@everyone ';
    }
    guild.channels.cache.find(channel => channel.id === _channel).send({
        content: mention,
        embeds: [newEmbed]
    });
}