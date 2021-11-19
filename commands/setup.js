const { MessageEmbed, Permissions } = require('discord.js');
const fs = require('fs');
const writeTo = require('../modules/writeTo');
const main = require('../main');
let settings = null;
let setupMember;

const requiredPermissions = [
    'SEND_MESSAGES',
    'VIEW_CHANNEL',
    'READ_MESSAGE_HISTORY',
    'MANAGE_CHANNELS',
    'MANAGE_ROLES'
];

function checkReqPermissions(message) {
    let guild = main.getGuild();
    let lackedPermissions = "";
    for(let i = 0; i < requiredPermissions.length; i++) {
        if(!guild.me.permissions.has(requiredPermissions[i])) {
            lackedPermissions += ', '
            lackedPermissions += requiredPermissions[i];
        }
    }
    if(lackedPermissions !== "") {
        message.channel.send(`Connect 4 Bot is lacking the following permissions that are neccessary for proper function: ${lackedPermissions}.`)
    }
    else{
        console.log("Permission check successful, all required permissions are granted.");
    }
}

async function setupServer() {
    const guild = main.getGuild();
    const botRole = guild.roles.cache.find((role) => role.name === 'Connect4Bot');

    settings.roles = {};
    settings.channels = {};

    //#region Roles
    const modRole = await guild.roles.create({
        name: 'Connect-4 Moderator',
        color: 'PURPLE',
        mentionable: false
    }).catch(console.error);
    settings.roles.mod = modRole.id; writeTo('./settings.json', settings);

    const redRole = await guild.roles.create({
        name: 'Red Team',
        color: 'RED',
        mentionable: true
    }).catch(console.error);
    settings.roles.red = redRole.id; writeTo('./settings.json', settings);

    const yellowRole = await guild.roles.create({
        name: 'Yellow Team',
        color: 'YELLOW',
        mentionable: true
    }).catch(console.error);
    settings.roles.yellow = yellowRole.id; writeTo('./settings.json', settings);
    //#endregion
    //#region Channels
    const category = await guild.channels.create('connect-4', { 
        type: 'GUILD_CATEGORY',
    })
    settings.channels.category = category.id;

    const gameOutput = await guild.channels.create('connect-4', {
        type: 'GUILD_TEXT',
        topic: 'Check here for updates on the current Connect-4 Game',
    }).then((channel) => channel.setParent(category));
    gameOutput.permissionOverwrites.set([
        {
            id: guild.roles.everyone,
            deny: [Permissions.FLAGS.SEND_MESSAGES],
        },
        {
            id: botRole.id,
            allow: [Permissions.FLAGS.SEND_MESSAGES],
        },
    ]);
    settings.channels.gameOutput = gameOutput.id;
    

    const noTeam = await guild.channels.create('join-a-team', {
        type: 'GUILD_TEXT',
        topic: 'Use !join <red, yellow> to join a team'
    }).then((channel) => channel.setParent(category));
    noTeam.permissionOverwrites.set([
        {
            id: redRole.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: yellowRole.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
    ]);
    settings.channels.noTeam = noTeam.id;

    const redChannel = await guild.channels.create('red-team',{
        type: 'GUILD_TEXT',
        topic: 'Discuss and vote for the next move here'
    }).then((channel) => channel.setParent(category));
    redChannel.permissionOverwrites.set([
        {
            id: guild.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: redRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: botRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: modRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
    ]);
    settings.channels.red = redChannel.id;

    const yellowChannel = await guild.channels.create('yellow-team',{
        type: 'GUILD_TEXT',
        topic: 'Discuss and vote for the next move here'
    }).then((channel) => channel.setParent(category));
    yellowChannel.permissionOverwrites.set([
        {
            id: guild.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: yellowRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: botRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: modRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
    ]);
    settings.channels.yellow = yellowChannel.id;

    const modChannel = await guild.channels.create('mod-commands', {
        type: 'GUILD_TEXT',
        topic: 'Send high-level commands to the bot',
    }).then((channel) => channel.setParent(category));
    modChannel.permissionOverwrites.set([
        {
            id: guild.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: botRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: modRole.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
    ]);
    settings.channels.mod = modChannel.id;
    //#endregion
    
    settings.hasBeenSetup = true;
    writeTo('./settings.json', settings);

    setupMember.roles.add(modRole);

    let modChannelObj = guild.channels.cache.get(settings.channels.mod);
    modChannelObj.send("Setup Completed with 0 errors. Hooray!:tada: \n\nYou might need to change the role heirarchy a bit, though. \nFor a list of commands, type \"!info\".")
}

module.exports = {
    name: 'setup',
    description: "Sets up the bot to work with different servers. [MODERATOR]",
    execute(message, args){
        settings = JSON.parse(fs.readFileSync('./settings.json'));
        if(settings.hasBeenSetup) {
            message.channel.send("Server already setup!");
            return;
        }
        console.log("Commencing permission check...");
        checkReqPermissions(message);

        setupMember = message.member;
        settings.response = 'setup';
        writeTo('./settings.json', settings);

        var embed  = new MessageEmbed()
            .setColor('#000000')
            .setTitle('Are you sure you would like to enter setup? Type \"y\" to confirm. Type \"n\" to cancel.')
            .setDescription("This will create 3 new roles and a new channel category where the Connect 4 game will take place.");

        message.channel.send({ embeds:[embed] });
    },
    
    response(message) {
        settings = JSON.parse(fs.readFileSync('./settings.json'));
        if(message.member === setupMember) {
            if(message.content === 'y') {
                message.channel.send("Beginning Setup...");
                setupServer();
            }
            else {
                message.channel.send("Cancelling Setup");
            }
        }
    }
}