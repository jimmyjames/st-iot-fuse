module.exports = controller => {
    controller.hears("^help", "slash_command", (slashCommand, message) => {
        slashCommand.replyAcknowledge();
        slashCommand.replyPrivateDelayed(
            message,
            `I can control your SmartThings. _e.g.,_ \`${message.command} turn on the kitchen\` to turn on the kitchen lights`
        );
    });
};
