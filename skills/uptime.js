module.exports = controller => {
    controller.hears(["^uptime", "^debug", "^alive"], ["slash_command"], (slashCommand, message) => {
        slashCommand.replyAcknowledge();

        slashCommand.replyPublicDelayed(message, `I have been alive for ${formatUptime(process.uptime())}.`);
    });

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
    function formatUptime(uptime) {
        var unit = "second";
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = "minute";
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = "hour";
        }
        if (parseInt(uptime) != 1) {
            unit = unit + "s";
        }

        uptime = parseInt(uptime) + " " + unit;
        return uptime;
    }
};
