const fs = require('fs');
const writeTo = require('../functions/writeTo');
module.exports = {
    name: 'vote',
    description: "Vote for the next move\nArguments: (Column to vote for; \"1\", \"2\", \"3\", etc.)",
    allowedChannels: [ 'red', 'yellow' ],
    execute(message, args) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(settings.gameStarted === false) {
            message.channel.send("A game has not started yet");
            return;
        }

        //check if user already voted
        for(let i = 0; i < settings.votes.length; i++){
            let votesArr = settings.votes[i].split(' ');
            if(message.author.id === votesArr[1]) {
                message.channel.send("You have already voted!");
                return;
            }
        }

        if(!args[0] == Math.floor(args[0]) || //is a decimal
            args[0] > settings.gridColumns || 
            args[0] < 1 //out of range
            ){
            message.channel.send("Column index out of range.");
            return;
        }
        if(!settings.grid.rows[0][args[0]].state === 'empty') 
            message.channel.send("Illegal Move! Double check the game board before voting again.");

        if(settings.turn === 'red' && message.member.roles.cache.has(settings.roles.red)) 
            castVote();
        else if(settings.turn === 'yellow' && message.member.roles.cache.has(settings.roles.yellow)) 
            castVote();
        else
            message.channel.send("It's not your turn!");

        function castVote() {
            var adjVote = args[0] - 1;
            let vote = adjVote + ' ' + message.author.id;

            settings.votes[settings.votes.length] = vote;
            writeTo(`./settings/${message.guild.id}.json`, settings);

            message.channel.send("Vote cast!");
        }
    }
}