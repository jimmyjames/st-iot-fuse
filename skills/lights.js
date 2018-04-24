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

        if (!validCommand(command)) {
            return slashCommand.replyPrivateDelayed(
                message,
                `Hi! You asked me to "turn ${command}" the "${switchName}" lights. I can only turn switches on or off. Try "${message.command} turn on/off the ${switchName}"`
            );
        }

        const opts = {
            name: switchName,
            capability: "switch",
            controller: controller,
            user: message.user_profile
        };

        console.log("will call deviceApi.getDevice");

        let device = await devicesApi.getDevice(opts);

        if (!device) {
            return slashCommand.replyPrivateDelayed(
                message, 
                `Sorry, I can't find a switch with the name "${switchName}"`);
        }

        console.log(`Found device ${JSON.stringify(device)}`);

        const switchOpts = {
            deviceId: "", // TODO
            capability: "", // TODO
            command: "", // TODO
            controller: controller,
            user: message.user_profile
        };

        let success = await devicesApi.actuateDevice(switchOpts);
        
        if (success) {
            return slashCommand.replyPrivateDelayed(message, `Woot! I turned ${command} your ${switchName} switch`);
        } else {
            return slashCommand.replyPrivateDelayed(message, `Hmmmm. There was an error turning ${command} your ${switchName} switch`);
        }
        
    });
};

function validCommand(command) {
    return ["on", "off"].indexOf(command) >= 0;
}
