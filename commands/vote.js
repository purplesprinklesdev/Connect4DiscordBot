const fs = require('fs');
const checkAllowedChannels = require('../modules/checkAllowedChannels');
const writeTo = require('../modules/writeTo');
const game = require('../gamelogic/game')
module.exports = {
    name: 'vote',
    description: "Vote for the next move\nArguments: (Column to vote for; \"1\", \"2\", \"3\", etc.)",
    execute(message, args) {
        const settings = JSON.parse(fs.readFileSync('./settings.json'));
        const gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));

        var allowedChannels = 
        [ settings.channels.red, settings.channels.yellow ];
        if(!checkAllowedChannels(message, allowedChannels)) {
            return;
        }

        if(gameInfo.started === false) {
            message.channel.send("A game has not started yet");
            return;
        }

        //check if user already voted
        for(let i = 0; i < gameInfo.votes.length; i++){
            let votesArr = gameInfo.votes[i].split(' ');
            if(message.author.id === votesArr[1]) {
                message.channel.send("You have already voted!");
                return;
            }
        }

        if(!args[0] == Math.floor(args[0]) || //is a decimal
            args[0] > gameInfo.gridColumns || 
            args[0] < 1 //out of range
            ){
            message.channel.send("Column index out of range.");
            return;
        }
        if(!gameInfo.grid.rows[0][args[0]].state === 'empty') {
            message.channel.send("Illegal Move! Double check the game board before voting again.");
        }

        if(gameInfo.turn === 'red' && message.member.roles.cache.has(settings.roles.red)) {
            castVote();
        }
        else if(gameInfo.turn === 'yellow' && message.member.roles.cache.has(settings.roles.yellow)) {
            castVote();
        }
        else{
            message.channel.send("It's not your turn!");
        }
        function castVote() {
            var adjVote = args[0] - 1;
            let vote = adjVote + ' ' + message.author.id;

            gameInfo.votes[gameInfo.votes.length] = vote;
            writeTo('./gamelogic/gameInfo.json', gameInfo);

            message.channel.send("Vote cast!");
        }
    }
}