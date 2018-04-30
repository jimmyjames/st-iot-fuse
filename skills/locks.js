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

        const lockOptions = {
            devices: doors.items,
            capability: "lock",
            command: command, 
            controller: controller,
            user: message.user_profile
        };

        let results = await devicesApi.actuateDevices(lockOptions);
        if (!results.includes(true)) {
            return slashCommand.replyPrivateDelayed(
                message,
                `Hmmm. There was an error ${command}ing your doors.`
            );
        }
        if (results.every(value => true)) {
            return slashCommand.replyPrivateDelayed(
                message,
                `Ok, I ${command}ed ${results.length} ${results.length > 1 ? `doors`: `door`}!`
            );
        }
        return slashCommand.replyPrivateDelayed(
            message,
            `Err.... I managed to ${command} _some_ of your doors.`
        );
    });
};

function validCommand(command) {
    return ["lock", "unlock"].indexOf(command) >= 0;
}