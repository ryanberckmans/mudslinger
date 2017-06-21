var config = {};


/* If false, only serve socket.io and not http */
config.useHttpServer = true;

/* http server port if useHttpServer is true, else the socket.io port */
config.serverPort = 80;


/* targetHost and targetPort set as null means client can connect to any host/port.
Set these values to hardcode the connection to a specific host and port 

If hardcoding a target, be sure to also set hardcodedTarget to true in configClient.js
*/
config.targetHost = null; 
config.targetPort = null;


module.exports = config;
