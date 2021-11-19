const fs = require('fs');
module.exports = function(path, input) {
    var inputString = JSON.stringify(input);
    
    fs.writeFileSync(path, inputString, function(err){
        if(err){
            console.log(err)
            message.channel.send("WARNING: Failed to write to JSON, changes not saved!")
        }
    });
}