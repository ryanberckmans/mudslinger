let fs = require("fs");

// To be run from package root, paths accordingly
fs.createReadStream("configClient.js").pipe(fs.createWriteStream('static/configClient.js'));
