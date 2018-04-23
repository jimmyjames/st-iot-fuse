const axios = require("axios");
const qs = require("query-string");

// NOTE: This is a temporary OAuth URL. Real base URI for OAuth will be:
// const stAuthUrl = "https://api.smartthings.com";
const stAuthUrl = "https://oauthin-regional.api.smartthings.com";

module.exports = (webserver, controller) => {
    var handler = {
        login: (req, res) => {
            res.redirect(controller.getAuthorizeURL());
        },
        slackOauth: (req, res) => {
            var code = req.query.code;
            var state = req.query.state;

            // we need to use the Slack API, so spawn a generic bot with no token
            var slackapi = controller.spawn({});

            var opts = {
                client_id: controller.config.clientId,
                client_secret: controller.config.clientSecret,
                code: code
            };

            slackapi.api.oauth.access(opts, function(err, auth) {
                if (err) {
                    // debug("Error confirming oauth", err);
                    return res.redirect("/login_error.html");
                }

                // what scopes did we get approved for?
                var scopes = auth.scope.split(/\,/);

                // use the token we got from the oauth
                // to call auth.test to make sure the token is valid
                // but also so that we reliably have the team_id field!
                slackapi.api.auth.test({ token: auth.access_token }, function(err, identity) {
                    if (err) {
                        // debug("Error fetching user identity", err);
                        return res.redirect("/auth_error.html");
                    }

                    // Now we've got all we need to connect to this user's team
                    // spin up a bot instance, and start being useful!
                    // We just need to make sure this information is stored somewhere
                    // and handled with care!

                    // In order to do this in the most flexible way, we fire
                    // a botkit event here with the payload so it can be handled
                    // by the developer without meddling with the actual oauth route.

                    auth.identity = identity;
                    controller.trigger("oauth:success", [auth]);

                    res.cookie("team_id", auth.team_id);
                    // res.cookie("bot_user_id", auth.bot.bot_user_id);
                    res.redirect("/auth_success.html");
                });
            });
        },
        stOauth: async (req, res) => {
            if (req.query && req.query.error) {
                return res.redirect("/auth_failed.html");
            }

            let code = req.query.code;
            let user_id = req.query.state;
            let formData = qs.stringify({
                grant_type: "authorization_code",
                code: code,
                client_id: process.env.stClientId,
                redirect_uri: `${process.env.host}/st/oauth`
            });

            let response = await axios.post(
                `${stAuthUrl}/oauth/token`,
                // payload
                formData,
                // config
                {
                    auth: {
                        username: process.env.stClientId,
                        password: process.env.stClientSecret
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            if (response.status === 200) {
                controller.storage.users.get(user_id, (err, user) => {
                    user.smartThings = {
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        scope: response.scope
                    };
                    controller.storage.users.save(user);
                    console.log(`Add SmartThings auth to user: ${JSON.stringify(user)}`);
                });
                res.redirect("/auth_success.html");
            } else {
                console.log(response.data);
                res.redirect("/auth_failed.html");
            }
        }
    };

    // Slack button
    webserver.get("/login", handler.login);

    // Slack OAuth
    webserver.get("/slack/oauth", handler.slackOauth);

    // SmartThings OAuth
    webserver.get("/st/oauth", handler.stOauth);

    return handler;
};
