var config = {};


/* If false, only serve socket.io and not http */
config.useHttpServer = true;

/* http server port if useHttpServer is true, else the socket.io port */
config.serverPort = 80;


module.exports = config;
