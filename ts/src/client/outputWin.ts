import {Message, MsgDef} from "./message";
import {OutWinBase} from "./outWinBase";
import {TriggerManager} from "./triggerManager";
import * as Util from "./util";

export class OutputWin extends OutWinBase {
    private html: string;

    constructor(private message: Message, private triggerManager: TriggerManager) {
        super();

        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
        this.message.telnetConnect.subscribe(this.handleTelnetConnect, this);
        this.message.telnetDisconnect.subscribe(this.handleTelnetDisconnect, this);
        this.message.telnetError.subscribe(this.handleTelnetError, this);
        this.message.wsError.subscribe(this.handleWsError, this);
        this.message.wsConnect.subscribe(this.handleWsConnect, this);
        this.message.wsDisconnect.subscribe(this.handleWsDisconnect, this);
        this.message.sendCommand.subscribe(this.handleSendCommand, this);
        this.message.scriptSendCommand.subscribe(this.handleScriptSendCommand, this);
        this.message.sendPw.subscribe(this.handleSendPw, this);
        this.message.triggerSendCommands.subscribe(this.handleTriggerSendCommands, this);
        this.message.aliasSendCommands.subscribe(this.handleAliasSendCommands, this);
        this.message.scriptPrint.subscribe(this.handleScriptPrint, this);
        this.message.scriptEvalError.subscribe(this.handleScriptEvalError, this);
        this.message.scriptExecError.subscribe(this.handleScriptExecError, this);

        $(document).ready(() => {
            window.onerror = this.handleWindowError.bind(this);
        });
    }

    private prepareReloadLayout() {
        this.html = $("#win_output").html();
    }

    private loadLayout() {
        this.setRootElem($("#win_output"));
        if (this.html) {
            // it"s a reload
            $("#win_output").html(this.html);
            this.scrollBottom(true);
            this.html = null;
        }
    }

    private handleScriptPrint(data: MsgDef.ScriptPrintMsg) {
        let message = data.value;
        let output = JSON.stringify(message);
        this.target.append(
            "<span style=\"color:orange\">"
            + Util.rawToHtml(output)
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };

    private handleSendPw(data: MsgDef.SendPwMsg) {
        // let stars = ("*".repeat(msg.data.length);
        let stars = Array(data.value.length + 1).join("*");

        this.target.append(
            "<span style=\"color:yellow\">"
            + stars
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };

    private handleSendCommand(data: MsgDef.SendCommandMsg) {
        if (data.noPrint) {
            return;
        }
        let cmd = data.value;
        this.target.append(
            "<span style=\"color:yellow\">"
            + Util.rawToHtml(cmd)
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };

    private handleScriptSendCommand(data: MsgDef.ScriptSendCommandMsg) {
        if (data.noPrint) {
            return;
        }
        let cmd = data.value;
        this.target.append(
            "<span style=\"color:cyan\">"
            + Util.rawToHtml(cmd)
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };

    private handleTriggerSendCommands(data: MsgDef.TriggerSendCommandsMsg) {
        let html = "<span style=\"color:cyan\">";

        for (let i = 0; i < data.commands.length; i++) {
            if (i >= 5) {
                html += "...<br>";
                break;
            } else {
                html += Util.rawToHtml(data.commands[i]) + "<br>";
            }
        }
        this.target.append(html);
        this.scrollBottom(false);
    };

    private handleAliasSendCommands(data: MsgDef.AliasSendCommandsMsg) {
        let html = "<span style=\"color:yellow\">";
        html += Util.rawToHtml(data.orig);
        html += "</span><span style=\"color:cyan\"> --> ";

        for (let i = 0; i < data.commands.length; i++) {
            if (i >= 5) {
                html += "...<br>";
                break;
            } else {
                html += Util.rawToHtml(data.commands[i]) + "<br>";
            }
        }

        this.target.append(html);
        this.scrollBottom(true);
    };

    private handleTelnetConnect(): void {
        this.target.append(
            "<span style=\"color:cyan\">"
            + "[[Telnet connected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };
    private handleTelnetDisconnect() {
        this.target.append(
            "<span style=\"color:cyan\">"
            + "[[Telnet disconnected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };
    private handleWsConnect() {
        this.target.append(
            "<span style=\"color:cyan\">"
            + "[[Websocket connected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(false);
    };

    private handleWsDisconnect() {
        this.target.append(
            "<span style=\"color:cyan\">"
            + "[[Websocket disconnected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(false);
    };

    private handleTelnetError(data: MsgDef.TelnetErrorMsg) {
        this.target.append(
            "<span style=\"color:red\">"
            + "[[Telnet error" + "<br>"
            + data.value + "<br>"
            + "]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };

    private handleWsError() {
        this.target.append(
            "<span style=\"color:red\">"
            + "[[Websocket error]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    };

    private handleWindowError(message: any, source: any, lineno: any, colno: any, error: any) {
        this.target.append(
            "<span style=\"color:red\">"
            + "[[Web Client Error<br>"
            + message + "<br>"
            + source + "<br>"
            + lineno + "<br>"
            + colno + "<br>"
            + "]]"
            + "<br>"
            + "</span>"
        );
        this.scrollBottom(true);
    };

    private handleScriptEvalError(data: MsgDef.ScriptEvalErrorMsg) {
        let err: any = data.value;
        let stack = Util.rawToHtml(err.stack);

        this.target.append(
            "<span style=\"color:red\">"
            + "[[Script eval error<br>"
            + stack + "<br>"
            + "]]"
            + "<br>"
            + "</span>"
        );
        this.scrollBottom(true);
    };

    private handleScriptExecError(data: MsgDef.ScriptExecErrorMsg) {
        let err: any = data.value;
        let stack = Util.rawToHtml(err.stack);

        this.target.append(
            "<span style=\"color:red\">"
            + "[[Script execution error<br>"
            + stack + "<br>"
            + "]]"
            + "<br>"
            + "</span>"
        );
        this.scrollBottom(true);
    };

    protected handleLine(line: string) {
        this.triggerManager.handleLine(line);
    };

}
