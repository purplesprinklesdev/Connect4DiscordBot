const discord = require('discord.js');
const dotenv = require('dotenv');
const checkAllowedChannels = require('./functions/checkAllowedChannels');
const writeTo = require('./functions/writeTo');
const date = require('./functions/date');
const game = require('./game');
const timers = require('./functions/timers');

dotenv.config();
const fs = require('fs');

const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_MEMBERS] 
});

const prefix = '!';

client.commands = new discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Connect4Bot is online');

    //set up schedules again if the bot shuts down
    const settingsFiles = fs.readdirSync('./settings/').filter(file => file.endsWith('.json'));
    for(const file of settingsFiles) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${file}`));
        if(file == 'emojis.json' || !settings.schedule)
            continue;

        const guild = client.guilds.cache.get(file.slice(0, file.search('.json')));

        var difference = date.difference(date.current(), settings.schedule);
        if(difference < 60) {
            difference = 60;
            settings.schedule = date.add(60);
            writeTo(`./settings/${file}`, settings);
        }

        const modChannel = guild.channels.cache.get(settings.channels.mod);
        try{
            if(settings.scheduleReason == 'start')
                timers.add(guild.id, setTimeout(game.start, difference * 1000, settings.lastTickTime, guild));
            else if(settings.scheduleReason == 'tick') 
                timers.add(guild.id, setTimeout(game.resume, difference * 1000, settings.lastTickTime, guild));
        }
        catch (err){
            modChannel.send("An error occured while executing a scheduled action.")
            console.log("An error occured while executing a scheduled action: " + err);
        }

        
        modChannel.send(`It seems that the bot was shut off before it could execute a ${settings.scheduleReason} according to its schedule. The game will now ${settings.scheduleReason} in ${difference} seconds. Use !reschedule to change this.`);
    }
});


client.on('messageCreate', message => {
    const settingsFiles = fs.readdirSync('./settings/').filter(file => file.endsWith('.json'));
    
    if(message.author.bot) return;
    if(message.channel.type == 'DM') return;

    if(!message.content.startsWith(prefix)) {
        if(settingsFiles.includes(`${message.guild.id}.json`)) {
            const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
            if(settings.response !== '' && settings.responseMember === message.member.id) {
                try {
                    if(message.content === 'y') 
                        client.commands.get(settings.response).response(message);
                }
                catch (err){
                    message.channel.send("An error occured while processing the command.");
                    console.log("An error occured while processing a command: " + err);
                }
                
            }
        }
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(!settingsFiles.includes(`${message.guild.id}.json`) && command != 'setup') {
        message.channel.send("You must set up the server before you can use commands. Type \"!setup\".");
        return;
    }

    var commandFile;
    commandFile = client.commands.get(command);
    if(commandFile == undefined) {
        message.channel.send("Invalid command! Type !info for a list of commands.");
        return;
    }

    if(!checkAllowedChannels(message, commandFile.allowedChannels)) {
        message.channel.send("You either don't have sufficient permissions to execute this command or are using it in the wrong channel. Check !info.");
        return;
    }
    
    commandFile.execute(message, args);
    /*try{
        
    }
    catch (err){
        message.channel.send("An error occured while processing the command.");
        console.log("An error occured while processing a command: " + err);
    }*/
    
});

client.login(process.env.TOKEN);