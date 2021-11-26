module.exports = {
    name: 'team',
    description: "Get your current team",
    allowedChannels: [ 'noTeam', 'red', 'yellow' ],
    execute(message){
        const author = message.member;
        var currentTeam;

        if(author.roles.cache.has(settings.roles.red)){
            currentTeam = 'Red';
        }
        else if(author.roles.cache.has(settings.roles.red)){
            currentTeam = 'Yellow';
        }
        else{
            message.channel.send("You are not currently on any team. Use !join to join one.")
            return;
        }
        message.channel.send(`You are on the ${currentTeam} Team.`);
    }
}