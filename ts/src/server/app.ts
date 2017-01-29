import * as express from 'express';
import * as socketio from 'socket.io';
import * as net from 'net';
import * as http from 'http';

import { IoEvent } from '../shared/ioevent';


let cwd = process.cwd();


let app = express();
let server = http.createServer(app);
let io = socketio(server);

var telnetNs = io.of("/telnet");
telnetNs.on('connection', (client: SocketIO.Socket) => {
    let telnet: net.Socket;
    let ioEvt = new IoEvent(client);

    ioEvt.ClReqTelnetOpen.handle(() => {
        telnet = new net.Socket();
        telnet.on('data', (data: Buffer) => {
            ioEvt.SrvTelnetData.fire(data.buffer);
        });
        telnet.on('close', (had_error: boolean) => {
            ioEvt.SrvTelnetClosed.fire(had_error);
        });

        telnet.connect(7000, "aarchonmud.com", () => {
            ioEvt.SrvTelnetOpened.fire(null);
        });
    });

    ioEvt.ClReqTelnetClose.handle(() => {
        telnet.end();
    });

    ioEvt.ClReqTelnetWrite.handle((data) => {
        telnet.write(data);
    });
});

app.use(express.static("static"));

app.get("/", function(req, res) {
    res.sendFile("static/client.html", {root: cwd});
});

server.listen(5000, function() {
    console.log("Server is running at port 5000");
});
