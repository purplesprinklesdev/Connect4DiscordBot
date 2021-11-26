const fs = require('fs');
module.exports= function (message, allowedChannels) {
    let settings;
    try{
        settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));
    }
    catch(err){
        return true;
    }
    
    let channelIDs = [];
    for(let i = 0; i < allowedChannels.length; i++) {
        switch(allowedChannels[i]) {
            case 'noTeam': channelIDs[channelIDs.length] = settings.channels.noTeam; break;
            case 'red': channelIDs[channelIDs.length] = settings.channels.red; break;
            case 'yellow': channelIDs[channelIDs.length] = settings.channels.yellow; break;
            case 'mod': channelIDs[channelIDs.length] = settings.channels.mod; break;
            case 'all': return true;
        }
    }
    return channelIDs.includes(message.channel.id);
}