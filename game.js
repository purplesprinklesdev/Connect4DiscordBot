const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const writeTo = require('./functions/writeTo');
const date = require('./functions/date');
const timers = require('./functions/timers');

exports.start = function (sec, guild) {
    let settings = null;
    try{
        settings = JSON.parse(fs.readFileSync(`./settings/${guild.id}.json`));
    }
    catch(err) {
        console.log(err);
        return;
    }
    timers.stop(guild.id);


    settings.grid = new Grid(6, 7);
    settings.gameStarted = true;
    settings.turnNumber = 0;

    var roleMention;
    var channelMention;
    if(Math.round(Math.random()) == 1) {
        settings.turn = 'red';
        roleMention = settings.roles.red;
        channelMention = settings.channels.red;
    }
    else {
        settings.turn = 'yellow';
        roleMention = settings.roles.yellow;
        channelMention = settings.channels.yellow;
    }
    writeTo(`./settings/${guild.id}.json`, settings);


    const embed = new MessageEmbed()
        .setColor('#000000')
        .setTitle('Connect 4')
        .setDescription(render(settings.grid));
    
    let mention = ' ';
    if(settings.pingEveryone) 
        mention = '@everyone';
    guild.channels.cache.get(settings.channels.gameOutput).send({
        content: mention,
        embeds: [embed]
    });

    guild.channels.cache.get(settings.channels.gameOutput).send(
        `<@&${roleMention}>, you go first! Go to <#${channelMention}> and discuss your next move. When you're ready to vote, use !vote.`
    );

    settings.schedule = date.add(sec);
    settings.scheduleReason = 'tick';
    writeTo(`./settings/${guild.id}.json`, settings);
    timers.add(guild.id, setTimeout(tick, sec * 1000, sec, guild));
}
exports.resume = function (sec, guild) {
    timers.stop(guild.id);
    tick(sec, guild);
}
function tick(sec, guild) {
    let settings = null;
    try{
        settings = JSON.parse(fs.readFileSync(`./settings/${guild.id}.json`));
    }
    catch(err) {
        console.log(err);
        return;
    }
    if(settings.gameStarted == false || settings.schedule == null)
        return;
    
    settings.schedule = date.add(sec);
    settings.scheduleReason = 'tick';
    writeTo(`./settings/${guild.id}.json`, settings);
    timers.add(guild.id, setTimeout(exports.resume, sec * 1000, sec, guild));

    //--Vote Counting--
    //settings.votes is unsorted, each value contains the column the vote is for and the if of the user that picked it.
    //(this is so people can't vote twice)

    let votes = [];
    //votes will contain the same info as settings.votes, (minus user ids) but in a more useful format:
    //index is the column; value is the amount of votes

    for (i = 0; i < settings.votes.length; i++) {
        //take off user id
        var column = settings.votes[i].slice(0, 1);

        if (!votes[column])
            votes[column] = 0;

        votes[column]++;
    }
    if (settings.votes.length === 0) {
        var column = Math.round(Math.random() * settings.grid.columnCount - 1);
        votes[column] = 1;
    }

    settings.votes = [];

    //resolve ties
    let winColumn = 0;
    var highestScore = 0;
    for (let i = 0; i < votes.length; i++) {
        if (votes[i] > highestScore) {
            winColumn = i;
            highestScore = votes[i];
        }
        else if (votes[i] === highestScore) {
            if (Math.random() > 0.5)
                winColumn = i;
        }
    }

    //drop piece down the column
    let space;
    for (let i = settings.grid.rowCount - 1; i > -1; i--) {
        space = settings.grid.rows[i][winColumn];
        if (space.state === "empty") {
            space.state = settings.turn; break;
        }
    }

    let win = checkForWin();
    function checkForWin() {
        //#region Horizontal
        let horizontalWin = 1;
        //Left
        for (let i = -1; i > -4 && space.column + i >= 0; i--) {
            HorizontalWinCheck(i);
        }
        //Right
        for (let i = 1; i < 4 && space.column + i < settings.grid.columnCount; i++) {
            HorizontalWinCheck(i);
        }
        function HorizontalWinCheck(i) {
            let selectedSpace = settings.grid.rows[space.row][space.column + i]

            if (!selectedSpace || selectedSpace.state !== settings.turn)
                return;

            horizontalWin++;
        }
        if (horizontalWin >= 4)
            return true;

        //#endregion
        //#region Vertical
        let verticalWin = 1;
        //Up
        for (let i = -1; i > -4 && space.row + i >= 0; i--) {
            VerticalWinCheck(i);
        }
        //Down
        for (let i = 1; i < 4 && space.row + i < settings.rowCount; i++) {
            VerticalWinCheck(i);
        }
        function VerticalWinCheck(i) {

            let selectedSpace = settings.grid.rows[space.row + i][space.column];

            if (!selectedSpace || selectedSpace.state !== settings.turn) {
                return;
            }
            verticalWin++;
        }
        if (verticalWin >= 4) {
            return true;
        }
        //#endregion
        //#region DiagLeft
        let diagLeftWin = 1;
        //Down and right
        for (let i = 1; i < 4 && space.row + i < settings.grid.rowCount && space.column + i < settings.grid.columnCount; i++) {
            DiagLeftWinCheck(i);
        }
        //Up and left
        for (let i = -1; i > -4 && space.row + i >= 0 && space.column + i >= 0; i--) {
            DiagLeftWinCheck(i);
        }
        function DiagLeftWinCheck(i) {
            let selectedSpace = settings.grid.rows[space.row + i][space.column + i];

            if (!selectedSpace || selectedSpace.state !== settings.turn)
                return;

            diagLeftWin++;
        }
        if (diagLeftWin >= 4)
            return true;

        //#endregion
        //#region DiagRight
        let diagRightWin = 1;
        //Up and right
        for (let i = 1; i < 4 && space.row - i >= 0 && space.column + i < settings.grid.columnCount; i++) {
            DiagRightWinCheck(i);
        }
        //Down and left
        for (let i = -1; i > -4 && space.row - i < settings.grid.rowCount && space.column + i >= 0; i--) {
            DiagRightWinCheck(i);
        }
        function DiagRightWinCheck(i) {
            let selectedSpace = settings.grid.rows[space.row - i][space.column + i];

            if (!selectedSpace || selectedSpace.state !== settings.turn)
                return;

            diagRightWin++;
        }
        if (diagRightWin >= 4)
            return true;

        return false;
        //#endregion
    }

    settings.turnNumber++;

    let gameChannel = guild.channels.cache.get(settings.channels.gameOutput);

    const embed = new MessageEmbed()
        .setColor('#000000')
        .setTitle('Connect 4 - Turn ' + settings.turnNumber)
        .setDescription(render(settings.grid));

    let mention = ' ';
    if(settings.pingEveryone) 
        mention = '@everyone';
    guild.channels.cache.get(gameChannel.id).send({
        content: mention,
        embeds: [embed]
    });

    var roleMention;
    if (win) {
        if (settings.turn === 'red') roleMention = settings.roles.red;
        if (settings.turn === 'yellow') roleMention = settings.roles.yellow;

        gameChannel.send(`:tada: <@&${roleMention}>** won the game!** :tada:`);
        timers.stop(guild.id);
        settings.schedule = null;
        settings.scheduleReason = '';
        writeTo(`./settings/${guild.id}.json`, settings);
        return;
    }

    //if there are no valid moves
    var closedSpaces = 0;

    for (let i = 0; i < settings.grid.columnCount; i++) {
        if (!settings.grid.rows[0][i].state === 'empty')
            closedSpaces++;
    }
    if (closedSpaces === settings.grid.columnCount) {
        gameChannel.send(`No possible moves left! No one wins!`);
        timers.stop(guild.id);
        settings.schedule = null;
        settings.scheduleReason = '';
        writeTo(`./settings/${guild.id}.json`, settings);
        return;
    }


    //set next turn
    var roleMention;
    var channelMention;
    if (settings.turn === 'red') {
        roleMention = settings.roles.yellow;
        channelMention = settings.channels.yellow;

        settings.turn = 'yellow';
    }
    else {
        roleMention = settings.roles.red;
        channelMention = settings.channels.red;

        settings.turn = 'red';
    }
    settings.votes = [];
    writeTo(`./settings/${guild.id}.json`, settings);

    guild.channels.cache.get(settings.channels.gameOutput).send(
        `<@&${roleMention}>, it's your turn! Go to <#${channelMention}> and discuss your next move. When you're ready to vote, use !vote.`
    );
}
function render(grid) {
    const emojis = JSON.parse(fs.readFileSync('./settings/emojis.json'));

    let fullString = '';
    function wall() { fullString += emojis.wall; }
    function lineBreak() { fullString += "\n"; }

    wall();
    for (let currentCol = 0; currentCol < grid.columnCount; currentCol++) {
        if (!grid.rows[0][currentCol].state === 'empty') {
            fullString += emojis.columnFull; continue;
        }
        switch (currentCol) {
            case 0: fullString += ':one:'; break;
            case 1: fullString += ':two:'; break;
            case 2: fullString += ':three:'; break;
            case 3: fullString += ':four:'; break;
            case 4: fullString += ':five:'; break;
            case 5: fullString += ':six:'; break;
            case 6: fullString += ':seven:'; break;
            case 7: fullString += ':eight:'; break;
            case 8: fullString += ':nine:'; break;
            case 9: fullString += ':ten:'; break;
        }
    }
    wall();

    lineBreak();

    //render the grid
    for (let currentRow = 0; currentRow < grid.rowCount; currentRow++) {
        wall();
        for (let currentCol = 0; currentCol < grid.columnCount; currentCol++) {
            var space = grid.rows[currentRow][currentCol];
            fullString += getSpaceImage(space);
        }
        wall();

        lineBreak();
    }

    //bottom wall -- column count is +2 because we have to cover the corners
    for (let currentCol = 0; currentCol < grid.columnCount + 2; currentCol++) {
        wall();
    }
    return fullString;
}
class Grid {
    constructor(rows, columns) {
        this.rows = [];
        for (let currentRow = 0; currentRow < rows; currentRow++) {
            //make a new array for this row
            const row = [];

            //make every column in this row empty
            for (let currentCol = 0; currentCol < columns; currentCol++) {
                row[currentCol] = new Space("empty", currentRow, currentCol);
            }

            //set this row to row currentRow in rows array
            this.rows[currentRow] = row;
        }
        this.rowCount = rows;
        this.columnCount = columns;
    }
}
class Space {
    constructor(state, row, column) {
        if (state === "empty" || state === "red" || state === "yellow")
            this.state = state;

        else
            console.log("Invalid State");

        this.row = row;
        this.column = column;
    }
}

function getSpaceImage(space) {
    const emojis = JSON.parse(fs.readFileSync('./settings/emojis.json'));
    if (space.state === "empty")
        return emojis.empty;
    else if (space.state === "red")
        return emojis.red;
    else
        return emojis.yellow;
}