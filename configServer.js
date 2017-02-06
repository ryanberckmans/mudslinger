var config = {};


config.gameHost = "127.0.0.1";
config.gamePort = 7000;

/* If false, only serve socket.io and not http */
config.useHttpServer = false;

/* http server port if useHttpServer is true, else the socket.io port */
config.serverPort = 7024;


module.exports = config;
