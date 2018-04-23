module.exports = controller => {
    controller.hears(["^gdpr", "^forget me", "logout"], "slash_command", (slashCommand, message) => {
        slashCommand.replyAcknowledge();

        let failResponse = "Sorry, I ran into an issue while trying to forget your data.",
            successResponse = "Okay! 👏 I've forgotten your data. You'll need to re-authorize again.";

        controller.storage.users.get(message.user_id, (err, user_data) => {
            if (err) {
                console.log(err);
                return slashCommand.replyPrivateDelayed(message, failResponse);
            }
            if (!user_data.smartThings) {
                return slashCommand.replyPrivateDelayed(message, "No worries, I don't know anything about you yet!");
            }
            // tell them what we'll be deleting
            slashCommand.replyPrivateDelayed(
                message,
                {
                    text: "We have some of your data stored. Here's what I'll forget:",
                    attachments: [
                        {
                            fallback: "Your data is going to be deleted",
                            fields: [
                                {
                                    title: "SmartThings access token",
                                    value: user_data.smartThings.accessToken
                                },
                                {
                                    title: "SmartThings refresh token",
                                    value: user_data.smartThings.refreshToken
                                }
                            ],
                            color: "#ff0000",
                            footer: "SmartThings API",
                            footer_icon:
                                "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-04-06/343786731543_4da9866406a8bb03749a_72.png",
                            ts: new Date().getTime() / 1000
                        }
                    ]
                },
                err => {
                    if (err) {
                        console.log(err);
                    }
                    // delete it
                    user_data.smartThings = undefined;
                    controller.storage.users.save(user_data, err2 => {
                        slashCommand.replyPrivateDelayed(message, err2 ? badResponse : successResponse);
                    });
                }
            );
        });
    });
};
