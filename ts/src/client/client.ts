/// <reference path="../../definitions/polyfill.d.ts" />

import { GlEvent } from "./event";

import { AffWin } from "./affWin";
import { AliasEditor } from "./aliasEditor";
import { AliasManager } from "./aliasManager";
import { ChatWin } from "./chatWin";
import { CommandInput } from "./commandInput";
import { GaugeWin } from "./gaugeWin";
import { JsScript } from "./jsScript";
import { JsScriptWin } from "./jsScriptWin";
import { MapWin } from "./mapWin";
import { MenuBar } from "./menuBar";

import { Mxp } from "./mxp";
import { OutputManager } from "./outputManager";
import { OutputWin } from "./outputWin";
import { Socket } from "./socket";
import { StatWin } from "./statWin";
import { TriggerEditor } from "./triggerEditor";
import { TriggerManager } from "./triggerManager";

export class Client {
    private affWin: AffWin;
    private aliasEditor: AliasEditor;
    private aliasManager: AliasManager;
    private chatWin: ChatWin;
    private commandInput: CommandInput;
    private gaugeWin: GaugeWin;
    private jsScript: JsScript;
    private jsScriptWin: JsScriptWin;
    private mapWin: MapWin;
    private menuBar: MenuBar;
    private mxp: Mxp;
    private outputManager: OutputManager;
    private outputWin: OutputWin;
    private socket: Socket;
    private statWin: StatWin;
    private triggerEditor: TriggerEditor;
    private triggerManager: TriggerManager;

    constructor() {
        this.affWin = new AffWin();
        this.jsScript = new JsScript();
        this.chatWin = new ChatWin();
        this.gaugeWin = new GaugeWin();
        this.mapWin = new MapWin();
        this.statWin = new StatWin();

        this.jsScriptWin = new JsScriptWin(this.jsScript);
        this.triggerManager = new TriggerManager(this.jsScript);
        this.aliasManager = new AliasManager(this.jsScript);

        this.commandInput = new CommandInput(this.aliasManager);

        this.outputWin = new OutputWin(this.triggerManager);

        this.aliasEditor = new AliasEditor(this.aliasManager);
        this.triggerEditor = new TriggerEditor(this.triggerManager);

        this.outputManager = new OutputManager(this.outputWin);

        this.mxp = new Mxp(this.outputManager, this.chatWin);
        this.socket = new Socket(this.outputManager, this.mxp);
        this.menuBar = new MenuBar(this, this.socket, this.aliasEditor, this.triggerEditor, this.jsScriptWin);

        $(document).ready(() => {
            this.socket.open();
            this.socket.openTelnet();

        //    $(window).resize(Client.reload_layout);
            this.loadLayout();
        });

        // Prevent navigating away accidentally
        window.onbeforeunload = () => {
            return "";
        };
    }

    private htmlBase: string;

    private loadLayout() {
        // If it"s the first load, grab the base html so we can
        // use it for reloads
        if (!this.htmlBase) {
            this.htmlBase = $("#client").html();
//            console.log(html_base);
        } else {
            // it"s a reload
            $("#client").html(this.htmlBase);
        };

        // do the high level layout
        (<any>$("#main_vert_split")).jqxSplitter({
            width: "100%",
            height: "100%",
            orientation: "vertical",
            panels: [{size: "75%"}, {size: "25%"}]
        });
        console.log("Turkey");

        // let the other guys do their thing
        GlEvent.loadLayout.fire(null);

    }

    public reloadLayout(): void {
        // Let the other guys prepare
        GlEvent.prepareReloadLayout.fire(null);
        this.loadLayout();
    }
}
