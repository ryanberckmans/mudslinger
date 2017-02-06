let fs = require("fs");

let flnameConfigClient = "configClient.js"
let flnameConfigClientDefault = "configClient.default.js"

let flnameConfigServer = "configServer.js"
let flnameConfigServerDefault = "configServer.default.js"

// To be run from package root, paths accordingly
fs.createReadStream("node_modules/socket.io-client/dist/socket.io.min.js").pipe(fs.createWriteStream('static/socket.io.min.js'));
fs.createReadStream("node_modules/jquery/dist/jquery.min.js").pipe(fs.createWriteStream('static/jquery.min.js'));

// Don't want to overwrite existing config file if any
if (!fs.exists(flnameConfigClient)) {
    fs.createReadStream(flnameConfigClientDefault).pipe(fs.createWriteStream(flnameConfigClient));
}

if (!fs.exists(flnameConfigServer)) {
    fs.createReadStream(flnameConfigServerDefault).pipe(fs.createWriteStream(flnameConfigServer));
}