const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const writeTo = require('../functions/writeTo');

let roles = [];
let channels = [];

function resetServer(message) {
    const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
    roles = [
        settings.roles.yellow,
        settings.roles.red,
        settings.roles.mod
    ];
    channels = [
        settings.channels.category,
        settings.channels.gameOutput,
        settings.channels.noTeam,
        settings.channels.red,
        settings.channels.yellow,
        settings.channels.mod
    ];

    for(let i = 0; i < roles.length; i++) {
        let role = message.guild.roles.cache.get(roles[i]);
        try { role.delete(); }
        catch(err) { message.channel.send(`Error occured while deleting role ${role}.`); }
    }
    for(let i = 0; i < channels.length; i++) {
        let channel = message.guild.channels.cache.get(channels[i]);
        try { channel.delete(); }
        catch(err) { message.channel.send(`Error occured while deleting channel ${channel}.`); }
    }

    fs.rmSync(`./settings/${message.guild.id}.json`);
    message.channel.send("Reset Complete");
}

module.exports = {
    name: 'reset',
    description: "Removes all bot-created roles and channels [MODERATOR]\nArguments: (Force server to reset while changing nothing; \"force\".)",
    allowedChannels: [ 'all' ],
    execute(message, args) { 
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        if(!settings || !settings.complete) {
            message.channel.send("Server has not been setup. There's nothing to remove!");
            return;
        }

        let modRole = message.guild.roles.cache.find(role => role.id === settings.roles.mod);
        if(!modRole) {
            fs.rmSync(`./settings/${message.guild.id}.json`);
            message.channel.send(`Server has been set up, but the mod role has been removed and your permissions cannot be verified. 
            A force reset has been completed, please manually remove all roles and channels and use !setup.`);
            return;
        }
        if(!message.member.roles.cache.has(modRole.id)) {
            message.channel.send("You do not have permission to use this command.");
            return;
        }

        if(args[0] === 'force') {
            fs.rmSync(`./settings/${message.guild.id}.json`);
            message.channel.send("Force reset complete.");
            return;
        }

        settings.response = 'reset';
        settings.responseMember = message.member.id;
        writeTo(`./settings/${message.guild.id}.json`, settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to reset? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription("This will remove all bot-created channels and roles.");

        message.channel.send({ embeds:[embed] });
    },

    response(message) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
        settings.response = '';
        writeTo(`./settings/${message.guild.id}.json`, settings);
        resetServer(message);
    }
}