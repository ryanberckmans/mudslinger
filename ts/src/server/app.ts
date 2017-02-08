import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as net from 'net';

import { IoEvent } from '../shared/ioevent';

let serverConfig = require("../../configServer.js");
console.log(serverConfig);

let cwd = process.cwd();

let app: express.Express;
let server: http.Server;
let io: SocketIO.Server;

if (serverConfig.useHttpServer === true) {
    app = express();
    server = http.createServer(app);
    io = socketio(server);
} else {
    io = socketio(serverConfig.serverPort)
}

var telnetNs: SocketIO.Namespace = io.of("/telnet");
telnetNs.on('connection', (client: SocketIO.Socket) => {
    let telnet: net.Socket;
    let ioEvt = new IoEvent(client);

    let writeQueue: any[] = [];
    let canWrite: boolean =  true;
    let checkWrite = () => {
        if (!canWrite) { return; }

        if (writeQueue.length > 0) {
            let data = writeQueue.shift();
            canWrite = false;
            canWrite = telnet.write(data as Buffer);
        }
    };

    let writeData = (data: any) => {
        writeQueue.push(data);
        checkWrite();
    };

    client.on("disconnect", () => {
        if (telnet) {
            telnet.end();
            telnet = null;
        }
    });

    ioEvt.clReqTelnetOpen.handle(() => {
        telnet = new net.Socket();

        telnet.on('data', (data: Buffer) => {
            ioEvt.srvTelnetData.fire(data.buffer);
        });
        telnet.on('close', (had_error: boolean) => {
            ioEvt.srvTelnetClosed.fire(had_error);
            telnet = null;
        });
        telnet.on("drain", () => {
            canWrite = true;
            checkWrite();
        })
        telnet.on("error", (err: Error) => {
            console.log("TELNET ERROR: ", err);
            ioEvt.srvTelnetError.fire(err.message);
        });

        telnet.connect(serverConfig.gamePort, serverConfig.gameHost, () => {
            ioEvt.srvTelnetOpened.fire(null);
        });
    });

    ioEvt.clReqTelnetClose.handle(() => {
        if (telnet == null) { return; }
        telnet.end();
        telnet = null;
    });

    ioEvt.clReqTelnetWrite.handle((data) => {
        if (telnet == null) { return; }
        writeData(data);
    });

    ioEvt.srvSetClientIp.fire(client.request.connection.remoteAddress);
});

if (serverConfig.useHttpServer) {
    app.use(express.static("static"));

    app.get("/", function(req, res) {
        res.sendFile("static/index.html", {root: cwd});
    });

    app.use((err: any, req: any, res: any, next: any) => {
        console.log("App error: " + 
                    "err: " + err + " | " +
                    "req: " + req + " | " +
                    "res: " + res + " | ");
        next(err);
    });

    server.on("error", (err: Error) => {
        console.log("Server error: ", err);
    });

    server.on("error", (err: Error) => {
        console.log("Server error: ", err);
    });

    server.listen(serverConfig.serverPort, function() {
        console.log("Server is running at port " + serverConfig.serverPort);
    });
}

