let fs = require("fs-extra");

let flnameConfigClient = "configClient.js"
let flnameConfigClientDefault = "configClient.default.js"

let flnameConfigServer = "configServer.js"
let flnameConfigServerDefault = "configServer.default.js"

// To be run from package root, paths accordingly
fs.createReadStream("node_modules/socket.io-client/dist/socket.io.min.js").pipe(fs.createWriteStream('static/socket.io.min.js'));
fs.createReadStream("node_modules/jquery/dist/jquery.min.js").pipe(fs.createWriteStream('static/jquery.min.js'));

fs.copySync("node_modules/jqwidgets-framework/jqwidgets", "static/jqwidgets");

fs.copySync("node_modules/codemirror/addon", "static/codemirror/addon");
fs.copySync("node_modules/codemirror/keymap", "static/codemirror/keymap");
fs.copySync("node_modules/codemirror/lib", "static/codemirror/lib");
fs.copySync("node_modules/codemirror/mode", "static/codemirror/mode");
fs.copySync("node_modules/codemirror/theme", "static/codemirror/theme");

fs.copySync("node_modules/codemirror/LICENSE", 'static/codemirror/LICENSE');

// Don't want to overwrite existing config file if any
if (!fs.existsSync(flnameConfigClient)) {
    fs.createReadStream(flnameConfigClientDefault).pipe(fs.createWriteStream(flnameConfigClient));
    console.log("Copying " + flnameConfigClientDefault + " to " + flnameConfigClient);
}

if (!fs.existsSync(flnameConfigServer)) {
    fs.createReadStream(flnameConfigServerDefault).pipe(fs.createWriteStream(flnameConfigServer));
    console.log("Copying " + flnameConfigServerDefault + " to " + flnameConfigServer);
}
