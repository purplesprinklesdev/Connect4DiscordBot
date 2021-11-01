const DiscordJS = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new DiscordJS.Client({
    intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.GUILD_MESSAGES] 
});

const prefix = '!';

const fs = require('fs');

client.commands = new DiscordJS.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('ChessBot is online')
});

client.on('messageCreate', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()
    client.commands.get(command).execute(message, args);
});

client.login(process.env.TOKEN);