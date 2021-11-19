const fs = require('fs');
const sendEmbed = require('../modules/sendEmbed')
const writeTo = require('../modules/writeTo');
const main = require('../main');

let timer;

exports.start = function(sec) {
    let settings = JSON.parse(fs.readFileSync('./settings.json'));
    let gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));

    gameInfo.grid = new Grid(6, 7);
    gameInfo.gameStarted = true;
    gameInfo.turn = 'red';
    gameInfo.turnNumber = 0;
    writeTo('./gamelogic/gameInfo.json', gameInfo);
    settings.lastTickTime = sec;
    writeTo('./settings.json', settings);

    sendEmbed(
        main.getGuild(),
        settings.channels.gameOutput,
        true,
        '#000000',
        "Connect 4",
        render(gameInfo.grid),
    );
    main.getGuild().channels.cache.find(channel => channel.id === settings.channels.gameOutput).send(
        `<@&${settings.roles.red}>, it's your turn! Go to <#${settings.channels.red}> and discuss your next move. When you're ready to vote, use !vote.`
    );


    timer = setInterval(tick, sec * 1000);
}
exports.stop = function() {
    let gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));

    gameInfo.gameStarted = false;
    writeTo('./gamelogic/gameInfo.json', gameInfo);

    clearInterval(timer);
}
exports.resume = function(sec) {
    let settings = JSON.parse(fs.readFileSync('./settings.json'));
    settings.lastTickTime = sec;
    writeTo('./settings.json', settings);
    
    timer = setInterval(tick, sec * 1000);
}
function tick() {
    let settings = JSON.parse(fs.readFileSync('./settings.json'));
    let gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));

    //--Vote Counting--
    //gameInfo.votes is unsorted, each value contains the column the vote is for and the if of the user that picked it.
    //(this is so people can't vote twice)

    let votes = [];
    //votes will contain the same info as gameInfo.votes, (minus user ids) but in a more useful format:
    //index is the column; value is the amount of votes
    
    for(i = 0; i < gameInfo.votes.length; i++) {
        //take off user id
        var column = gameInfo.votes[i].slice(0, 1);

        if(!votes[column]) 
            votes[column] = 0;

        votes[column]++;
    }
    if(gameInfo.votes.length === 0) {
        var column = Math.round(Math.random() * gameInfo.grid.columnCount);
        votes[column] = 1;
    }

    gameInfo.votes = [];
    writeTo('./gamelogic/gameInfo.json', gameInfo);

    //resolve ties
    let winColumn = 0;
    var highestScore = 0;
    for(let i = 0; i < votes.length; i++) {
        if(votes[i] > highestScore) {
            winColumn = i;
            highestScore = votes[i];
        }
        else if(votes[i] === highestScore) {
            if(Math.random() > 0.5)
                winColumn = i;
        }
    }
    
    //drop piece down the column
    let space;
    for(let i = gameInfo.grid.rowCount - 1; i > -1; i--) {
        console.log(`${i} + ${winColumn}`);
        space = gameInfo.grid.rows[i][winColumn];
        if(space.state === "empty") {
            space.state = gameInfo.turn; break;
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
        for (let i = 1; i < 4 && space.column + i < gameInfo.grid.columnCount; i++) {
            HorizontalWinCheck(i);
        }
        function HorizontalWinCheck(i) {
            let selectedSpace = gameInfo.grid.rows[space.row][space.column + i]

            if (!selectedSpace || selectedSpace.state !== gameInfo.turn)
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
        for (let i = 1; i < 4 && space.row + i < gameInfo.rowCount; i++) {
            VerticalWinCheck(i);
        }
        function VerticalWinCheck(i) {

            let selectedSpace = gameInfo.grid.rows[space.row + i][space.column];

            if (!selectedSpace || selectedSpace.state !== gameInfo.turn) {
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
        for (let i = 1; i < 4 && space.row + i < gameInfo.grid.rowCount && space.column + i < gameInfo.grid.columnCount; i++) {
            DiagLeftWinCheck(i);
        }
        //Up and left
        for (let i = -1; i > -4 && space.row + i >= 0 && space.column + i >= 0; i--) {
            DiagLeftWinCheck(i);
        }
        function DiagLeftWinCheck(i) {
            let selectedSpace = gameInfo.grid.rows[space.row + i][space.column + i];

            if (!selectedSpace || selectedSpace.state !== gameInfo.turn) 
                return;

            diagLeftWin++;
        }
        if (diagLeftWin >= 4)
            return true;
        
        //#endregion
        //#region DiagRight
        let diagRightWin = 1;
        //Up and right
        for (let i = 1; i < 4 && space.row - i >= 0 && space.column + i < gameInfo.grid.columnCount; i++) {
            DiagRightWinCheck(i);
        }
        //Down and left
        for (let i = -1; i > -4 && space.row - i < gameInfo.grid.rowCount && space.column + i >= 0; i--) {
            DiagRightWinCheck(i);
        }
        function DiagRightWinCheck(i) {
            let selectedSpace = gameInfo.grid.rows[space.row - i][space.column + i];

            if (!selectedSpace || selectedSpace.state !== gameInfo.turn)
                return;
            
            diagRightWin++;
        }
        if (diagRightWin >= 4)
            return true;
        
        return false;
        //#endregion
    }

    gameInfo.turnNumber++;

    let gameChannel = main.getGuild().channels.cache.get(settings.channels.gameOutput);
    sendEmbed(
        main.getGuild(),
        gameChannel.id,
        true,
        '#000000',
        "Connect 4 - Turn " + gameInfo.turnNumber,
        render(gameInfo.grid),
    );

    var mentionRole;

    if(win) {
        if(gameInfo.turn === 'red') mentionRole = settings.roles.red;
        if(gameInfo.turn === 'yellow') mentionRole = settings.roles.yellow;

        gameChannel.send(`:tada: <@&${mentionRole}>** won the game!** :tada:`);
        exports.stop();
        return;
    }

    //if there are no valid moves
    var closedSpaces = 0;

    for(let i = 0; i < gameInfo.grid.columnCount; i++) {
        if(!gameInfo.grid.rows[0][i].state === 'empty')
            closedSpaces++;
    }
    if(closedSpaces === gameInfo.columnCount) {
        gameChannel.send(`No possible moves left! No one wins!`);
        exports.stop();
        return;
    }

    var mentionRole;
    var mentionChannel;

    //set next turn
    if(gameInfo.turn === 'red'){
        mentionRole = settings.roles.yellow;
        mentionChannel = settings.channels.yellow;

        gameInfo.turn = 'yellow';
    }
    else{
        mentionRole = settings.roles.red;
        mentionChannel = settings.channels.red;

        gameInfo.turn = 'red';
    }
    gameInfo.votes = [];
    writeTo('./gamelogic/gameInfo.json', gameInfo);

    main.getGuild().channels.cache.find((channel) => channel.id === settings.channels.gameOutput).send(
        `<@&${mentionRole}>, it's your turn! Go to <#${mentionChannel}> and discuss your next move. When you're ready to vote, use !vote.`
    );
}
function render(grid) {
    let fullString = '';
    function wall() { fullString += ":blue_square:" }
    function lineBreak() { fullString += "\n" }

    wall();
    for(let currentCol = 0; currentCol < grid.columnCount; currentCol++){
        if(!grid.rows[0][currentCol].state === 'empty') {
            fullString += ":black_large_square:"; continue;
        }
        switch(currentCol){
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
    for(let currentRow = 0; currentRow < grid.rowCount; currentRow++) {
        wall();
        for(let currentCol = 0; currentCol < grid.columnCount; currentCol++){
            var space = grid.rows[currentRow][currentCol];
            fullString += getSpaceImage(space);
        }
        wall();

        lineBreak();
    }

    //bottom wall -- column count is +2 because we have to cover the corners
    for(let currentCol = 0; currentCol < grid.columnCount + 2; currentCol++){ 
        wall();
    }

    return fullString;
}
exports.getGrid = function() {
    const gameInfo = JSON.parse(fs.readFileSync('./gamelogic/gameInfo.json'));
    return gameInfo.grid;
}

function Grid(rows, columns)
{
    this.rows = [];
    for(let currentRow = 0; currentRow < rows; currentRow++) {
        //make a new array for this row
        const row = [];

        //make every column in this row empty
        for(let currentCol = 0; currentCol < columns; currentCol++){
            row[currentCol] = new Space("empty", currentRow, currentCol);
        }

        //set this row to row currentRow in rows array
        this.rows[currentRow] = row;
    }
    this.rowCount = rows;
    this.columnCount = columns;
}
function Space(state, row, column)
{
    if(state === "empty" || state === "red" || state === "yellow") {
        this.state = state;
    }
    else{
        console.log("Invalid State");
    }
    this.row = row;
    this.column = column;
}
function getSpaceImage(space) {
    let settings = JSON.parse(fs.readFileSync('./settings.json'));
        if(space.state === "empty"){
            return settings.symbols.empty;
        }
        else if(space.state === "red"){
            return settings.symbols.red;
        }
        else{
            return settings.symbols.yellow;
        }
}