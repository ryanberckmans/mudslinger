var config = {};


config.gameHost = "aarchonmud.com";
config.gamePort = 7000;

/* If false, only serve socket.io and not http */
config.useHttpServer = true;

/* http server port if useHttpServer is true, else the socket.io port */
config.serverPort = 7000;


module.exports = config;
