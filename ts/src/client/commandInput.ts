import {AliasManager} from "./aliasManager";
import {Message, MsgDef} from "./message";

export class CommandInput {
    private cmd_history: string[] = [];
    private cmd_index: number = -1;

    constructor(private message: Message, private aliasManager: AliasManager) {
        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
        this.message.setEcho.subscribe(this.handleSetEcho, this);
        this.message.telnetConnect.subscribe(this.handleTelnetConnect, this);

        $(document).ready(() => { this.loadHistory(); });
    }

    private prepareReloadLayout(): void {
        // nada
    }

    private loadLayout(): void {
        $("#cmd_input").keydown((event: any) => { return this.keydown(event); });
        $("#cmd_input").bind("input propertychange", () => { return this.inputChange(); });
        $("#cmd_input_pw").keydown((event: any) => { return this.pwKeydown(event); });
    };

    private echo: boolean = true;
    private handleSetEcho(data: MsgDef.SetEchoMsg): void {
        this.echo = data.value;

        if (this.echo) {
            $("#cmd_input_pw").hide();
            $("#cmd_input").show();
            $("#cmd_input").val("");
            $("#cmd_input").focus();
        } else {
            $("#cmd_input").hide();
            $("#cmd_input_pw").show();
            $("#cmd_input_pw").focus();

            let current = $("#cmd_input").val();
            if (this.cmd_history.length > 0
                && current !== this.cmd_history[this.cmd_history.length - 1]) {
                /* If they already started typing password before getting echo command*/
                $("#cmd_input_pw").val(current);
                $("#cmd_input_pw")[0].setSelectionRange(current.length, current.length);
            } else {
                $("#cmd_input_pw").val("");
            }
        }
    };

    private handleTelnetConnect(): void {
        this.handleSetEcho({value: true});
    };

    private sendPw(): void {
        let pw = $("#cmd_input_pw").val();
        this.message.sendPw.publish({value: pw});
    }

    private sendCmd(): void {
        let cmd: string = $("#cmd_input").val();
        let result = this.aliasManager.checkAlias(cmd);
        if (!result) {
            let cmds = cmd.split(";");
            for (let i = 0; i < cmds.length; i++) {
                this.message.sendCommand.publish({value: cmds[i]});
            }
        } else if (result !== true) {
            let cmds: string[] = [];
            let lines: string[] = (<string>result).replace("\r", "").split("\n");
            for (let i = 0; i < lines.length; i++) {
                cmds = cmds.concat(lines[i].split(";"));
            }
            this.message.aliasSendCommands.publish({orig: cmd, commands: cmds});
        } /* else the script ran already */

        $("#cmd_input").select();

        if (cmd.trim() === "") {
            return;
        }
        if (this.cmd_history.length > 0
            && cmd === this.cmd_history[this.cmd_history.length - 1]) {
            return;
        }

        if (this.echo) {
            this.cmd_history.push(cmd);
            this.cmd_history = this.cmd_history.slice(-20);
            this.saveHistory();
        }
        else {
            $("#cmd_input").val("");
        }
        this.cmd_index = -1;
    };

    private pwKeydown(event: KeyboardEvent): boolean {
        switch (event.which) {
            case 13: // enter
                this.sendPw();
                $("#cmd_input_pw").val("");
                return false;
            default:
                return true;
        }
    }

    private keydown(event: KeyboardEvent): boolean {
        switch (event.which) {
            case 13: // enter
                if (event.shiftKey) {
                    return true;
                } else {
                    this.sendCmd();
                    return false;
                }
            case 38: // up
                if (this.cmd_index === -1) {
                    this.cmd_index = this.cmd_history.length - 1;
                } else {
                    this.cmd_index -= 1;
                    this.cmd_index = Math.max(this.cmd_index, 0);
                }
                $("#cmd_input").val(this.cmd_history[this.cmd_index]);
                $("#cmd_input").select();
                return false;
            case 40: // down
                if (this.cmd_index === -1) {
                    break;
                }
                this.cmd_index += 1;
                this.cmd_index = Math.min(this.cmd_index, this.cmd_history.length - 1);
                $("#cmd_input").val(this.cmd_history[this.cmd_index]);
                $("#cmd_input").select();
                return false;
            default:
                this.cmd_index = -1;
                return true;
        }
        return false;
    }

    private inputChange(): void {
        let input = $("#cmd_input");
        input.height("1px");
        let scrollHeight = input[0].scrollHeight;
        let new_height = 10 + scrollHeight;
        input.height(new_height + "px");
    }

    private saveHistory(): void {
        localStorage.setItem("cmd_history", JSON.stringify(this.cmd_history));
    };

    private loadHistory(): void {
        let cmds = localStorage.getItem("cmd_history");
        if (cmds) {
            this.cmd_history = JSON.parse(cmds);
        }
    };

}
