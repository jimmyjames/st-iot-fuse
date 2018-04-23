var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var querystring = require("querystring");
var debug = require("debug")("botkit:webserver");
var http = require("http");
var hbs = require("express-hbs");

module.exports = controller => {
    var webserver = express();
    webserver.use(cookieParser());
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    // set up handlebars ready for tabs
    webserver.engine("hbs", hbs.express4({ partialsDir: __dirname + "/../views/partials" }));
    webserver.set("view engine", "hbs");
    webserver.set("views", __dirname + "/../views/");

    webserver.use(express.static("public"));

    var server = http.createServer(webserver);

    server.listen(process.env.PORT || 3000, null, () => {
        console.log(`Express webserver configured and listening at ${process.env.host}:${process.env.PORT || 3000}`);
    });

    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require("path").join(__dirname, "routes");
    require("fs")
        .readdirSync(normalizedPath)
        .forEach(file => {
            require("./routes/" + file)(webserver, controller);
        });

    controller.webserver = webserver;
    controller.httpserver = server;

    return webserver;
};
