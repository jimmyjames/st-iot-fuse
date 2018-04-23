/* Uses the slack button feature to offer a real time bot to multiple teams */
var env = require("node-env-file");
env(__dirname + "/.env");

var Botkit = require("botkit");
var debug = require("debug")("botkit:main");
var helpers = require(__dirname + "/components/helpers.js");
var devicesApi = require(__dirname + "/lib/devices.js");

if (
    !process.env.clientId ||
    !process.env.clientSecret ||
    !process.env.stClientId ||
    !process.env.stClientSecret ||
    !process.env.verificationToken ||
    !process.env.PORT
) {
    console.log("Please visit /installation to begin");
}

var config = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    stClientId: process.env.stClientId,
    stClientSecret: process.env.stClientSecret,
    verificationToken: process.env.verificationToken,
    scopes: ["commands"]
};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require("botkit-storage-mongo");
    config.storage = BotkitStorage({ mongoUri: process.env.MONGOLAB_URI });
} else {
    config.json_file_store = "./.db/";
}

var controller = Botkit.slackbot(config);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + "/components/express_webserver.js")(controller);

if (!process.env.clientId || !process.env.clientSecret || !process.env.stClientId || !process.env.stClientSecret) {
    webserver.get("/", (req, res) => {
        res.render("installation", {
            domain: req.get("host"),
            protocol: req.protocol,
            layout: "layouts/default"
        });
    });
} else {
    webserver.get("/", (req, res) => {
        res.render("index", {
            domain: req.get("host"),
            protocol: req.protocol,
            layout: "layouts/default"
        });
    });

    // Set up a simple storage backend for keeping a record of users
    // who sign up for the app via the oauth
    require(__dirname + "/components/user_registration.js")(controller);

    // import skills from directory
    var normalizedPath = require("path").join(__dirname, "skills");
    require("fs")
        .readdirSync(normalizedPath)
        .forEach(file => {
            require("./skills/" + file)(controller);
        });

    //  listen for authorization approval from interactive message
    controller.on("interactive_message_callback", async (slashCommand, message) => {
        // check message.actions and message.callback_id to see what action to take...
        if (message.callback_id === "911") {
            switch (message.actions[0].value) {
                case "delete":
                    console.log("delete");
                    return slashCommand.replyPrivateDelayed(message, {
                        delete_original: true
                    });

                    break;
                case "authorize":
                    console.log("authorize");
                    return slashCommand.replyPrivateDelayed(message, {
                        replace_original: true,
                        text: "Okay! Sending you to the SmartThings authorization page. Come back when you're done!"
                    });
                    break;
            }
        }
        if (message.callback_id === "followup_device_status") {
            if (message.actions && message.actions[0].name === "yes") {
                const opts = {
                    id: message.actions[0].value,
                    controller: controller,
                    user: message.user_profile
                };
                let status = await devicesApi.getDeviceStatus(opts);
                slashCommand.replyPrivateDelayed(message, {
                    replace_original: true,
                    text: `Status is: \`\`\`\n${JSON.stringify(status)}\n\`\`\``
                });
            }
        }
    });

    controller.on("slash_command", (slashCommand, message) => {
        console.log(`ACK: ${message.command} ${message.text}`);
        slashCommand.replyPrivate(slashCommand, `I don't know how to respond to \`${message.command} ${message.text}\``);
    });
}
