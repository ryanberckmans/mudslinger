import { GlEvent, GlDef } from "./event";

import { Client } from "./client";
import { Socket } from "./socket";
import { AliasEditor } from "./aliasEditor";
import { TriggerEditor } from "./triggerEditor";
import { JsScriptWin } from "./jsScriptWin";

export class MenuBar {
    constructor(
        private client: Client,
        private socket: Socket,
        private aliasEditor: AliasEditor,
        private triggerEditor: TriggerEditor,
        private jsScriptWin: JsScriptWin
        ) {
        this.makeClickFuncs();

        GlEvent.prepareReloadLayout.handle(this.prepareReloadLayout, this);
        GlEvent.loadLayout.handle(this.loadLayout, this);
    }

    private prepareReloadLayout() {
        // nada
    }

    private loadLayout() {
        (<any>$("#menu_bar")).jqxMenu({ width: "100%", height: "4%"});
        $("#menu_bar").on("itemclick", this.handleClick.bind(this));

        let o = this;
        $("#chk_enable_trig").change(function() {
            GlEvent.setTriggersEnabled.fire(this.checked);
        });

        $("#chk_enable_alias").change(function() {
            GlEvent.setAliasesEnabled.fire(this.checked);
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
    };
}
