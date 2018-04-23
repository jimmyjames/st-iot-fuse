const devicesApi = require("../lib/devices.js");

module.exports = controller => {
    controller.hears("(.*) the doors", ["slash_command"], async (slashCommand, message) => {
        slashCommand.replyAcknowledge();

        // unauthorized to execute device commands
        if (!message.user_profile.smartThings) {
            return;
        }

        //match[1] is the first (.*) group
        var command = message.match[1].toLowerCase();

        return slashCommand.replyPrivateDelayed(
            message,
            `Hi! You asked me to "${command} the doors. I can't do that yet, but will be able to soon!`
        );
    });
};
