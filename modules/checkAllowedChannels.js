module.exports= function (message, allowedChannels) {
    for(let i = 0; i < allowedChannels.length; i++){
        if(message.channel.id === allowedChannels[i]){
            return true;
        }
    }
    return false;
}