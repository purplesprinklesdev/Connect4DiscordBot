const discord = require('discord.js');
const dotenv = require('dotenv');
const writeTo = require('./modules/writeTo');

dotenv.config();
const fs = require('fs');

const settings = JSON.parse(fs.readFileSync('./settings.json'));
settings.response = null;
writeTo('./settings.json', settings);

const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_MEMBERS] 
});

const prefix = '!';
let guild = null;

client.commands = new discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('ChessBot is online')
});

client.on('messageCreate', message => {
    guild = message.guild;
    const settings = JSON.parse(fs.readFileSync('./settings.json'));

    if(message.author.bot) return;
    
    if(!message.content.startsWith(prefix)) {
        if(settings.response != null) {
            if(message.content === 'y') 
                client.commands.get(settings.response).response(message);
            
            settings.response = null;
            writeTo('./settings.json', settings);
            return;
        }
        else
            return;
    }

    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    if(!command) {
        message.channel.send("Invalid command! Type !info for a list of commands.");
        return;
    }
    if(!settings.hasBeenSetup){
        if(command === 'setup' || command === 'info') {  }
        else{
            message.channel.send("You must set up the server before you can use commands. Please type \"!setup\".");
            return;
        }
    }
    
    client.commands.get(command).execute(message, args);
});

exports.getGuild = function() {
    return guild;
}
exports.setGuild = function(_guild) {
    guild = _guild;
}

client.login(process.env.TOKEN);

//client.user.setPresence({ activities: [{ name: 'connect 4 with your mom' }], status: 'online' });