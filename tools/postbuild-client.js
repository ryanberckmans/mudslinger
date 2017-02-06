let fs = require("fs");

// To be run from package root, paths accordingly
let flnameConfigClient = "configClient.js";
fs.createReadStream(flnameConfigClient).pipe(fs.createWriteStream("static/" + flnameConfigClient));