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
            capability: "", // TODO
            controller: controller,
            user: message.user_profile
        };
    
        console.log(`Will call devicesApi.getDevices`);
    
        let doors = (await devicesApi.getDevices(options)).data;
    
        console.log(`Got locks: ${JSON.stringify(doors)}`);

        // TODO - if no devices found, message user (if they are, just notify user we will handle command next!)
        // Hint - getDevices() just returns the response from the List Devices API, as documented at
        // https://smartthings.developer.samsung.com/develop/api-ref/st-api.html#operation/getDevices
        // need to see if the API returned anything and that the items array is not empty
        return slashCommand.replyPrivateDelayed(
            message,
            `Hi! You asked me to "${command} the doors. I can't do that yet, but will be able to soon!`
        );

    });
};

function validCommand(command) {
    return ["lock", "unlock"].indexOf(command) >= 0;
}