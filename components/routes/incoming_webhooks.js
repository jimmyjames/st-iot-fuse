module.exports = (webserver, controller) => {
    webserver.post("/slack/receive", (req, res) => {
        // NOTE: we should enforce the token check here

        // Set the response to status 200
        // Note that the response is not yet sent
        // We need to respond to Slack that the
        // webhook has been received or Slack will
        // say the request timed out.
        res.status(200);

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res);
    });
};
