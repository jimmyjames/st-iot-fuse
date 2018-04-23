module.exports = controller => {
    const helpers = require(__dirname + "/../components/helpers.js");

    // Override the receive handler to log the message
    controller.middleware.receive.use((slashCommand, message, next) => {
        console.log("RCVD:", message);
        message.logged = true;
        next();
    });

    // Override the normalize handler and inject the user profile into every message
    controller.middleware.normalize.use((slashCommand, message, next) => {
        let user = message.user || message.user_id;

        // create a user record for anybody who uses the command
        if (message.type === "slash_command" || message.type === "interactive_message_callback") {
            controller.storage.users.get(user, (err, user_profile) => {
                if (err) {
                    var user = {
                        id: message.user_id || message.user,
                        team_id: message.team_id,
                        team_domain: message.team_domain,
                        user_name: message.user_name
                    };
                    message.user_profile = user;
                    controller.storage.users.save(user);
                } else {
                    message.user_profile = user_profile;
                }

                next();
            });
        }
    });

    // Ensure slash_command user is authorized |> offer them to authorize
    controller.middleware.heard.use((slashCommand, message, next) => {
        // If not authorized yet, offer it
        if (message.type === "slash_command" && (!message.user_profile || !message.user_profile.smartThings)) {
            var attachments = [];
            attachments.push(helpers.getConnectAttachments(message.user_id));

            // Reponse must be "delayed", or sending a message will
            // cause subsequent messages down the pipeline to fail.
            slashCommand.replyPrivateDelayed(message, {
                text: "You must sign in to your SmartThings account first",
                attachments: attachments
            });
        }

        next();
    });

    controller.middleware.send.use((bot, message, next) => {
        console.log("SEND:", message);
        message.logged = true;

        next();
    });
};
