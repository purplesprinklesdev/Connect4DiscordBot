const { MessageEmbed } = require('discord.js');
const fs = require('fs');
module.exports = {
    name: 'info',
    description: "Gives info about the bot",
    allowedChannels: [ 'noTeam', 'red', 'yellow', 'mod' ],
    execute(message, args) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        let isMod = null;
        try {
            isMod = message.member.roles.cache.has(settings.roles.mod);
        }
        catch(err) {
            isMod = true;
        }

        let embed = new MessageEmbed()
            .setColor('#000000')
            .setTitle("Connect 4 Bot Details")
            .setDescription("This bot allows for server-wide Connect 4 games.")
            .setFooter("Connect 4 Bot was created by Matthew Stall.");

        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for(const file of commandFiles) {
            const command = require(`./${file}`);
            if(!isMod && command.description.includes('[MODERATOR]'))
                continue;
            embed.addField(`!${command.name}`, command.description, false);
        }

        message.channel.send({ embeds: [embed] });
        if(!settings || !settings.complete) 
            message.channel.send("It seems like your server is not set up to use the bot yet. Use !setup.");
    }
}