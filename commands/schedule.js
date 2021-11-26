const fs = require('fs');
const date = require('../functions/date');
module.exports = {
    name: 'schedule',
    description: "Gives the current schedule. [MODERATOR]",
    allowedChannels: [ 'mod' ],
    execute(message) {
        const settings = JSON.parse(fs.readFileSync(`./settings/${message.guild.id}.json`));

        if(!settings.schedule || settings.scheduleReason == '') {
            message.channel.send("There is no current schedule.");
            return;
        }
        message.channel.send(`Action: \"${settings.scheduleReason}\". Schedule: \"${date.toString(settings.schedule)}\". Occurs in ${date.difference(date.current(), settings.schedule)} seconds.`);
    }
}