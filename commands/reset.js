const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const main = require('../main');
const writeTo = require('../modules/writeTo');
let settings = JSON.parse(fs.readFileSync('./settings.json'));

let setupMember;
let guild;

let roles = [];
let channels = [];

function resetServer(message) {
    for(let i = 0; i < roles.length; i++) {
        let role = main.getGuild().roles.cache.get(roles[i]);
        try { role.delete(); }
        catch(err) { message.channel.send(`Error occured while deleting role ${role}.`); }
        
    }
    for(let i = 0; i < channels.length; i++) {
        let channel = main.getGuild().channels.cache.get(channels[i]);
        try { channel.delete(); }
        catch(err) { message.channel.send(`Error occured while deleting channel ${channel}.`); }
    }
    settings.hasBeenSetup = false;
    writeTo('./settings.json', settings);
    message.channel.send("Reset Complete");
}

module.exports = {
    name: 'reset',
    description: "Removes all bot-created roles and channels [MODERATOR]\nArguments: (Force server to reset while changing nothing; \"force\".)",
    execute(message, args) { 
        settings = JSON.parse(fs.readFileSync('./settings.json'));
        guild = main.getGuild();
        if(!settings.hasBeenSetup) {
            message.channel.send("Server has not been setup. There's nothing to remove!");
            return;
        }
        if(args[0] === 'force') {
            settings.hasBeenSetup = false;
            writeTo('./settings.json', settings);
            message.channel.send("Force reset complete.");
            return;
        }
        let modRole = guild.roles.cache.find(role => role.id === settings.roles.mod);
        if(!message.member.roles.cache.has(modRole.id)) {
            message.channel.send("You do not have permission to use this command.");
            return;
        }
        
        
        setupMember = message.member;
        settings.response = 'reset';
        writeTo('./settings.json', settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to reset? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription("This will remove all bot-created channels and roles.");

        message.channel.send({ embeds:[embed] });
    },

    response(message) {
        if(message.member === setupMember) {
            if(message.content === 'y') {
                settings = JSON.parse(fs.readFileSync('./settings.json'));
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

                resetServer(message);
            }
            else {
                message.channel.send("Cancelling Reset");
            }
        }
    }
}