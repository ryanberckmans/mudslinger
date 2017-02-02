import { GlEvent, GlDef } from "./event";

import { OutWinBase } from "./outWinBase";
import { TriggerManager } from "./triggerManager";
import * as Util from "./util";

export class OutputWin extends OutWinBase {
    private divMyCont: HTMLPreElement;
    private $outputWin: JQuery;
    private html: string;

    constructor(cont: HTMLPreElement, private triggerManager: TriggerManager) {
        super();

        // this.divMyCont = cont;
        // this.divMyCont.innerHTML = `
        // <pre class="output-win"></pre>
        // `;
        this.divMyCont = cont;
        //this.$outputWin = $(this.divMyCont.getElementsByClassName("output-win")[0]);
        this.$outputWin = $(cont);
        
        let elem = this.$outputWin[0] as HTMLPreElement;
        elem.style.height = "calc(100% - 21px)";
        elem.style.margin = "0";
        elem.style.padding = "0";

        elem.style.fontSize = "10";
        elem.style.backgroundColor = "black";
        elem.style.fontFamily = "\"Courier\",monospace";
        elem.style.color = "rgb(0,187,0)";
        elem.style.whiteSpace = "pre-wrap";
        elem.style.overflowY = "scroll";
        elem.style.overflowX = "scroll";
        elem.style.width = "100%";

        this.setRootElem(this.$outputWin);

        GlEvent.telnetConnect.handle(this.handleTelnetConnect, this);
        GlEvent.telnetDisconnect.handle(this.handleTelnetDisconnect, this);
        GlEvent.telnetError.handle(this.handleTelnetError, this);
        GlEvent.wsError.handle(this.handleWsError, this);
        GlEvent.wsConnect.handle(this.handleWsConnect, this);
        GlEvent.wsDisconnect.handle(this.handleWsDisconnect, this);
        GlEvent.sendCommand.handle(this.handleSendCommand, this);
        GlEvent.scriptSendCommand.handle(this.handleScriptSendCommand, this);
        GlEvent.sendPw.handle(this.handleSendPw, this);
        GlEvent.triggerSendCommands.handle(this.handleTriggerSendCommands, this);
        GlEvent.aliasSendCommands.handle(this.handleAliasSendCommands, this);
        GlEvent.scriptPrint.handle(this.handleScriptPrint, this);
        GlEvent.scriptEvalError.handle(this.handleScriptEvalError, this);
        GlEvent.scriptExecError.handle(this.handleScriptExecError, this);

        $(document).ready(() => {
            window.onerror = this.handleWindowError.bind(this);
        });
    }

    private prepareReloadLayout() {
        // this.html = $("#win_output").html();
    }

    private loadLayout() {
        this.setRootElem(this.$outputWin);
        // if (this.html) {
        //     // it"s a reload
        //     $("#win_output").html(this.html);
        //     this.scrollBottom(true);
        //     this.html = null;
        // }
    }

    private handleScriptPrint(data: GlDef.ScriptPrintData) {
        let message = data;
        let output = JSON.stringify(message);
        this.$target.append(
            "<span style=\"color:orange\">"
            + Util.rawToHtml(output)
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleSendPw(data: GlDef.SendPwData) {
        // let stars = ("*".repeat(msg.data.length);
        let stars = Array(data.length + 1).join("*");

        this.$target.append(
            "<span style=\"color:yellow\">"
            + stars
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleSendCommand(data: GlDef.SendCommandData) {
        if (data.noPrint) {
            return;
        }
        let cmd = data.value;
        this.$target.append(
            "<span style=\"color:yellow\">"
            + Util.rawToHtml(cmd)
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleScriptSendCommand(data: GlDef.ScriptSendCommandData) {
        if (data.noPrint) {
            return;
        }
        let cmd = data.value;
        this.$target.append(
            "<span style=\"color:cyan\">"
            + Util.rawToHtml(cmd)
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleTriggerSendCommands(data: GlDef.TriggerSendCommandsData) {
        let html = "<span style=\"color:cyan\">";

        for (let i = 0; i < data.length; i++) {
            if (i >= 5) {
                html += "...<br>";
                break;
            } else {
                html += Util.rawToHtml(data[i]) + "<br>";
            }
        }
        this.$target.append(html);
        this.scrollBottom(false);
    }

    private handleAliasSendCommands(data: GlDef.AliasSendCommandsData) {
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

        this.$target.append(html);
        this.scrollBottom(true);
    }

    private handleTelnetConnect(): void {
        this.$target.append(
            "<span style=\"color:cyan\">"
            + "[[Telnet connected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleTelnetDisconnect() {
        this.$target.append(
            "<span style=\"color:cyan\">"
            + "[[Telnet disconnected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }
    
    private handleWsConnect() {
        this.$target.append(
            "<span style=\"color:cyan\">"
            + "[[Websocket connected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(false);
    }

    private handleWsDisconnect() {
        this.$target.append(
            "<span style=\"color:cyan\">"
            + "[[Websocket disconnected]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(false);
    }

    private handleTelnetError(data: GlDef.TelnetErrorData) {
        this.$target.append(
            "<span style=\"color:red\">"
            + "[[Telnet error" + "<br>"
            + data + "<br>"
            + "]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleWsError() {
        this.$target.append(
            "<span style=\"color:red\">"
            + "[[Websocket error]]"
            + "<br>"
            + "</span>");
        this.scrollBottom(true);
    }

    private handleWindowError(message: any, source: any, lineno: any, colno: any, error: any) {
        this.$target.append(
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
    }

    private handleScriptEvalError(data: GlDef.ScriptEvalErrorData) {
        let err: any = data;
        let stack = Util.rawToHtml(err.stack);

        this.$target.append(
            "<span style=\"color:red\">"
            + "[[Script eval error<br>"
            + stack + "<br>"
            + "]]"
            + "<br>"
            + "</span>"
        );
        this.scrollBottom(true);
    }

    private handleScriptExecError(data: GlDef.ScriptExecErrorData) {
        let err: any = data;
        let stack = Util.rawToHtml(err.stack);

        this.$target.append(
            "<span style=\"color:red\">"
            + "[[Script execution error<br>"
            + stack + "<br>"
            + "]]"
            + "<br>"
            + "</span>"
        );
        this.scrollBottom(true);
    }

    protected handleLine(line: string) {
        this.triggerManager.handleLine(line);
    }
}
