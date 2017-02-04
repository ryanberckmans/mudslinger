import { GlEvent, GlDef } from "./event";

import { Client } from "./client";
import { Socket } from "./socket";
import { AliasEditor } from "./aliasEditor";
import { TriggerEditor } from "./triggerEditor";
import { JsScriptWin } from "./jsScriptWin";

export class MenuBar {
    private $menuBar: JQuery;
    private $chkEnableTrig: JQuery;
    private $chkEnableAlias: JQuery;

    constructor(
        private client: Client,
        private socket: Socket,
        private aliasEditor: AliasEditor,
        private triggerEditor: TriggerEditor,
        private jsScriptWin: JsScriptWin
        ) {

        this.makeClickFuncs();

        this.$menuBar = $("#menuBar");
        this.$chkEnableTrig = $("menuBar-chkEnableTrig");
        this.$chkEnableAlias = $("menuBar-chkEnableAlias");

        (<any>this.$menuBar).jqxMenu({ width: "100%", height: "4%"});
        this.$menuBar.on("itemclick", (event: any) => { this.handleClick(event); });

        this.$chkEnableTrig.change(function() {
            GlEvent.setTriggersEnabled.fire(this.checked);
        });

        this.$chkEnableAlias.change(function() {
            GlEvent.setAliasesEnabled.fire(this.checked);
        });
    }

    private clickFuncs: {[k: string]: () => void} = {};
    private makeClickFuncs() {
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
            console.log("harpdeerrp");
            this.triggerEditor.show();
        };

        this.clickFuncs["Green"] = () => {
            GlEvent.changeDefaultColor.fire("green");
        };

        this.clickFuncs["White"] = () => {
            GlEvent.changeDefaultColor.fire("white");
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
    }
}
