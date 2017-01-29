import * as express from 'express';
import * as socketio from 'socket.io';
import * as net from 'net';
import * as http from 'http';

import { EvtDef } from '../shared/ioevent';


let cwd = process.cwd();


let app = express();
let server = http.createServer(app);
let io = socketio(server);

var telnetNs = io.of("/telnet");
telnetNs.on('connection', (client: SocketIO.Socket) => {
    let telnet: net.Socket;

    client.on('reqTelnetOpen', () => {
        telnet = new net.Socket();
        telnet.on('data', (data: Buffer) => {
            client.emit('telnetData', {value: data.buffer} as EvtDef.TelnetData);
        });
        telnet.on('close', (had_error: boolean) => {
            client.emit('telnetClosed', {had_error: had_error} as EvtDef.TelnetClosed);
        });

        telnet.connect(7000, "aarchonmud.com", () => {
            client.emit("telnetOpened", {} as EvtDef.TelnetOpened);
        });
    });

    client.on('reqTelnetClose', () => {
        telnet.end();
    });

    client.on('reqTelnetWrite', (data: EvtDef.ReqTelnetWrite) => {
        telnet.write(data.data);
    });
});

app.use(express.static("static"));

app.get("/", function(req, res) {
    res.sendFile("static/client.html", {root: cwd});
});

server.listen(5000, function() {
    console.log("Server is running at port 5000");
});
