import * as io from "socket.io-client";
import { Message, MsgDef } from "./message";
import { Mxp } from "./mxp";
import { OutputManager } from "./outputManager";
import { IoEvent } from "../shared/ioevent";
import { TelnetClient } from "./telnetClient";

export class Socket {
    private ioConn: SocketIOClient.Socket;
    private ioEvt: IoEvent;
    private telnetClient: TelnetClient;

    constructor(private message: Message, private outputManager: OutputManager, private mxp: Mxp) {
        this.message.sendCommand.subscribe(this.handleSendCommand, this);
        this.message.scriptSendCommand.subscribe(this.handleSendCommand, this);
        this.message.sendPw.subscribe(this.handleSendCommand, this);
        this.message.triggerSendCommands.subscribe(this.handleTriggerSendCommands, this);
        this.message.aliasSendCommands.subscribe(this.handleAliasSendCommands, this);
    }

    public open() {
        let o = this;

        this.ioConn = io.connect("http://" + document.domain + ":" + location.port + "/telnet");
        this.ioEvt = new IoEvent(this.ioConn);

        this.ioConn.on("connect", (msg: any) => {
            this.message.wsConnect.publish(null);
        });

        this.ioConn.on("disconnect", (msg: any) => {
            this.message.wsDisconnect.publish(null);
        });

        this.ioEvt.srvTelnetOpened.handle(() => {
            this.message.telnetConnect.publish(null);
        });

        this.ioEvt.srvTelnetClosed.handle(() => {
            this.message.telnetDisconnect.publish(null);
        });

        this.ioEvt.srvTelnetError.handle((data) => {
            this.message.telnetError.publish({value: data});
        });

        this.ioEvt.srvTelnetData.handle((data) => {
            this.telnetClient.handleData(data);
        });

        this.ioConn.on("error", (msg: any) => {
            this.message.wsError.publish(msg);
        });

        this.telnetClient = new TelnetClient((data) => {
            this.ioEvt.clReqTelnetWrite.fire(data);
        });

        this.telnetClient.EvtData.handle((data) => {
            this.handleTelnetData(data);
        });

        this.telnetClient.EvtServerEcho.handle((data) => {
            this.message.setEcho.publish({value: !data});
        });
    };

    public openTelnet() {
        this.ioEvt.clReqTelnetOpen.fire(null);
    };

    public closeTelnet() {
        this.ioEvt.clReqTelnetClose.fire(null);
    };

    private sendCmd(cmd: string) {
        cmd += "\n";
        let arr = new Uint8Array(cmd.length);
        for (let i = 0; i < cmd.length; i++) {
            arr[i] = cmd.charCodeAt(i);
        }
        this.ioEvt.clReqTelnetWrite.fire(arr.buffer);
    }

    private handleSendCommand(data: MsgDef.SendCommandMsg) {
        this.sendCmd(data.value);
    };

    private handleTriggerSendCommands(data: MsgDef.TriggerSendCommandsMsg) {
        for (let i = 0; i < data.commands.length; i++) {
            this.sendCmd(data.commands[i]);
        }
    };

    private handleAliasSendCommands(data: MsgDef.AliasSendCommandsMsg) {
        for (let i = 0; i < data.commands.length; i++) {
            this.sendCmd(data.commands[i]);
        }
    };

    private partialSeq: string;
    private handleTelnetData(data: ArrayBuffer) {
        console.timeEnd("command_resp");
        console.time("_handle_telnet_data");

        let rx = this.partialSeq || "";
        this.partialSeq = null;
        rx += String.fromCharCode.apply(String, new Uint8Array(data));

        let output = "";
        let rx_len = rx.length;
        let max_i = rx.length - 1;

        for (let i = 0; i < rx_len; ) {
            let char = rx[i];

            /* strip carriage returns while we"re at it */
            if (char === "\r") {
                i++; continue;
            }

            /* Always snip at a newline so other modules can more easily handle logic based on line boundaries */
            if (char === "\n") {
                output += char;
                i++;

                this.outputManager.handleText(output);
                output = "";

                // MXP needs to force close any open tags on newline
                this.mxp.handleNewline();

                continue;
            }

            if (char !== "\x1b") {
                output += char;
                i++;
                continue;
            }

            /* so we have an escape sequence ... */
            /* we only expect these to be color codes or MXP tags */
            let substr = rx.slice(i);
            let re;
            let match;

            /* ansi escapes */
            re = /^\x1b\[(\d+(?:;\d+)?)m/;
            match = re.exec(substr);
            if (match) {
                this.outputManager.handleText(output);
                output = "";

                i += match[0].length;
                let codes = match[1].split(";");
                this.outputManager.handleAnsiGraphicCodes(codes);
                continue;
            }

            /* xterm 256 color */
            re = /^\x1b\[[34]8;5;\d+m/;
            match = re.exec(substr);
            if (match) {
                this.outputManager.handleText(output);
                output = "";

                i += match[0].length;
                this.outputManager.handle_xterm_escape(match[0]);
                continue;
            }

            /* MXP escapes */
            re = /^\x1b\[1z(<.*?>)\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                // MXP tag. no discerning what it is or if it"s opening/closing tag here
                i += match[0].length;
                this.outputManager.handleText(output);
                output = "";
                this.message.mxpTag.publish({value: match[1]});
                continue;
            }

            re = /^\x1b\[7z/;
            match = re.exec(substr);
            if (match) {
                /* this gets sent once at the beginning to set the line mode. We don"t need to do anything with it */
                i += match[0].length;
                continue;
            }

            /* need to account for malformed tags or sequences somehow... for now just treat a newline as a boundary */
            let nl_ind = substr.indexOf("\n");
            if (nl_ind !== -1) {
                let bad_stuff = substr.slice(0, nl_ind + 1);
                i += bad_stuff.length;
                console.log("Malformed sequence or tag");
                console.log(bad_stuff);
                continue;
            }

            /* If we get here, must be a partial sequence
                Send away everything up to the sequence start and assume it will get completed next time
                we receive data...
             */
            if (i !== 0) {
                this.outputManager.handleText(output);
            }
            this.partialSeq = rx.slice(i);
            console.log("Got partial:");
            console.log(this.partialSeq);
            break;
        }
        if (!this.partialSeq) {
            /* if partial we already outputed, if not let"s hit it */
            this.outputManager.handleText(output);
        }
        this.outputManager.outputDone();
//        console.timeEnd("_handle_telnet_data");
//        requestAnimationFrame(function() {
            console.timeEnd("_handle_telnet_data");
//        });
    };

}