import * as express from 'express';
import * as socketio from 'socket.io';
import * as net from 'net';
import * as http from 'http';

import { IoEvent } from '../shared/ioevent';


let cwd = process.cwd();

let app = express();
let server = http.createServer(app);
let io = socketio(server);

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

    ioEvt.clReqTelnetOpen.handle(() => {
        telnet = new net.Socket();

        telnet.on('data', (data: Buffer) => {
            ioEvt.srvTelnetData.fire(data.buffer);
        });
        telnet.on('close', (had_error: boolean) => {
            ioEvt.srvTelnetClosed.fire(had_error);
        });
        telnet.on("drain", () => {
            canWrite = true;
            checkWrite();
        })
        telnet.on("error", (err: Error) => {
            console.log("TELNET ERROR: ", err);
            ioEvt.srvTelnetError.fire(err.message);
        });

        telnet.connect(7000, "aarchonmud.com", () => {
        // telnet.connect(7101, "rooflez.com", () => {
            ioEvt.srvTelnetOpened.fire(null);
        });
    });

    ioEvt.clReqTelnetClose.handle(() => {
        telnet.end();
    });

    ioEvt.clReqTelnetWrite.handle((data) => {
        writeData(data);
    });

    ioEvt.srvSetClientIp.fire(client.request.connection.remoteAddress);
});

app.use(express.static("static"));

app.get("/", function(req, res) {
    res.sendFile("static/client.html", {root: cwd});
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

server.listen(5000, function() {
    console.log("Server is running at port 5000");
});
