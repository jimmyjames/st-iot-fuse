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

        if (!validCommand(command)) {
            return slashCommand.replyPrivateDelayed(
                message,
                `Hmmm 🤨 You asked me to "${command}" the doors, but I only know how to *lock* or *unlock* doors. Try \`${
                    message.command
                } lock the doors\``
            );
        }
    
        const options = {
            capability: "lock",
            controller: controller,
            user: message.user_profile
        };
    
        console.log(`Will call devicesApi.getDevices`);
    
        let doors = (await devicesApi.getDevices(options)).data;

        if (!doors || doors.items.length === 0) {
            return slashCommand.replyPrivateDelayed(message, `Sorry, I can't find any doors to ${command}`);
        }

        console.log(`Got locks: ${JSON.stringify(doors)}`);

        // TODO
        // - Call actuateDevices, store the results (actuateDevices returns an array of booleans,
        //           indicating success/failure of sending commands)
        // - Finish actuateDevices implementation in devices.js
        // - Check the results to see if any commands failed, and notify user
        // - If all commands succeeded, notify user.
        const lockOptions = {
            devices: [], // TODO
            capability: "", // TODO
            command: "", // TODO
            controller: controller,
            user: message.user_profile
        };

        return slashCommand.replyPrivateDelayed(
            message,
            `TODO - make me ${command} your doors!`
        );
    });
};

function validCommand(command) {
    return ["lock", "unlock"].indexOf(command) >= 0;
}