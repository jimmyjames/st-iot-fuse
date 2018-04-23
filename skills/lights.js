const devicesApi = require("../lib/devices.js");

// Example of "listening" for phrases from a slash command
module.exports = controller => {
    controller.hears("turn (.*) the (.*)", ["slash_command"], async (slashCommand, message) => {
        slashCommand.replyAcknowledge();

        // unauthorized to execute device commands
        if (!message.user_profile.smartThings) {
            return;
        }

        //match[1] is the first (.*) group
        var command = message.match[1].toLowerCase();
        //match[2] is the second (.*) group.
        var switchName = message.match[2];

        console.log(`Lights skill - command: ${command}`);
        console.log(`Lights skill - switchName: ${switchName}`);

        return slashCommand.replyPrivateDelayed(
            message,
            `Hi! You asked me to "turn ${command} the ${switchName} lights. I can't do that yet, but will be able to soon!`
        );
    });
};
