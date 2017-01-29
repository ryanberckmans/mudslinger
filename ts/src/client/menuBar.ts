import {Client} from "./client";
import {Message, MsgDef} from "./message";
import {Socket} from "./socket";
import {AliasEditor} from "./aliasEditor";
import {TriggerEditor} from "./triggerEditor";
import {JsScriptWin} from "./jsScriptWin";

export class MenuBar {
    constructor(
        private message: Message,
        private client: Client,
        private socket: Socket,
        private aliasEditor: AliasEditor,
        private triggerEditor: TriggerEditor,
        private jsScriptWin: JsScriptWin
        ) {
        this.makeClickFuncs();

        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
    }

    private prepareReloadLayout() {
        // nada
    }

    private loadLayout() {
        $("#menu_bar").jqxMenu({ width: "100%", height: "4%"});
        $("#menu_bar").on("itemclick", (e: any) => this.handleClick(e));

        let o = this;
        $("#chk_enable_trig").change(function() {
            o.message.setTriggersEnabled.publish({value: this.checked});
        });

        $("#chk_enable_alias").change(function() {
            o.message.setAliasesEnabled.publish({value: this.checked});
        });
    };

    private clickFuncs: {[k: string]: () => void} = {};
    private makeClickFuncs() {
        this.clickFuncs["Reload Layout"] = () => {
            this.client.reloadLayout();
        };

        this.clickFuncs["Connect"] = () => {
            this.socket.openTelnet();
        };

        this.clickFuncs["Disconnect"] = () => {
            this.socket.closeTelnet();
        };

        this.clickFuncs["Aliases"] = () => {
            this.aliasEditor.show();
        };

        this.clickFuncs["Triggers"] = () => {
            this.triggerEditor.show();
        };

        this.clickFuncs["Green"] = () => {
            this.message.changeDefaultColor.publish({value: "green"});
        };

        this.clickFuncs["White"] = () => {
            this.message.changeDefaultColor.publish({value: "white"});
        };

        this.clickFuncs["Script"] = () => {
            this.jsScriptWin.show();
        };
    }

    private handleClick(event: any) {
        let item = event.args;
        let text = $(item).text();
        if (text in this.clickFuncs) {
            this.clickFuncs[text]();
        }
    };
}
