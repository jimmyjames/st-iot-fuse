module.exports.getAuthorizeLink = () => {
    const queryString = require("query-string");
    const api = "https://api.smartthings.com/v1";
    // NOTE: This is a temporary OAuth URL. Real base URI for OAuth will be:
    // const stAuthUrl = "https://api.smartthings.com";
    const stAuthUrl = "https://oauthin-regional.api.smartthings.com";
    const params = {
        client_id: process.env.stClientId,
        response_type: "code",
        redirect_uri: `${process.env.host}/st/oauth`,
        scope: "x:devices:* r:devices:*"
    };
    return `${stAuthUrl}/oauth/authorize?${queryString.stringify(params)}`;
};

module.exports.getConnectAttachments = user_id => {
    return {
        fallback: "You are unable to authorize with SmartThings",
        title: "Authorize with SmartThings",
        color: "#3e0d86",
        callback_id: "911",
        actions: [
            {
                name: "authorize",
                text: "Authorize with SmartThings",
                value: "authorize",
                type: "button",
                style: "primary",
                url: module.exports.getAuthorizeLink() + `&state=${user_id}`
            },
            {
                text: "Cancel",
                name: "cancel",
                value: "delete",
                type: "button",
                confirm: {
                    title: "Are you sure?",
                    text: "You won't be able to use this app if you don't authorize!",
                    ok_text: "Yes",
                    dismiss_text: "No"
                }
            }
        ],
        footer: "SmartThings",
        footer_icon: "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-04-06/343786731543_4da9866406a8bb03749a_72.png",
        ts: new Date().getTime() / 1000
    };
};
