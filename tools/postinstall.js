let fs = require("fs");

// To be run from package root, paths accordingly
fs.createReadStream("node_modules/socket.io-client/dist/socket.io.min.js").pipe(fs.createWriteStream('static/socket.io.min.js'));