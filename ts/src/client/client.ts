/// <reference path="../../definitions/jqwidgets.d.ts" />
/// <reference path="../../definitions/polyfill.d.ts" />

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
import { Message, MsgDef } from "./message";
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
    private message: Message;
    private mxp: Mxp;
    private outputManager: OutputManager;
    private outputWin: OutputWin;
    private socket: Socket;
    private statWin: StatWin;
    private triggerEditor: TriggerEditor;
    private triggerManager: TriggerManager;

    constructor() {
        this.message = new Message();
        this.affWin = new AffWin(this.message);
        this.jsScript = new JsScript(this.message);
        this.chatWin = new ChatWin(this.message);
        this.gaugeWin = new GaugeWin(this.message);
        this.mapWin = new MapWin(this.message);
        this.statWin = new StatWin(this.message);

        this.jsScriptWin = new JsScriptWin(this.jsScript);
        this.triggerManager = new TriggerManager(this.message, this.jsScript);
        this.aliasManager = new AliasManager(this.message, this.jsScript);

        this.commandInput = new CommandInput(this.message, this.aliasManager);

        this.outputWin = new OutputWin(this.message, this.triggerManager);

        this.aliasEditor = new AliasEditor(this.aliasManager);
        this.triggerEditor = new TriggerEditor(this.triggerManager);

        this.outputManager = new OutputManager(this.message, this.outputWin);

        this.mxp = new Mxp(this.message, this.outputManager, this.chatWin);
        this.socket = new Socket(this.message, this.outputManager, this.mxp);
        this.menuBar = new MenuBar(this.message, this, this.socket, this.aliasEditor, this.triggerEditor, this.jsScriptWin);

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
        $("#main_vert_split").jqxSplitter({
            width: "100%",
            height: "100%",
            orientation: "vertical",
            panels: [{size: "75%"}, {size: "25%"}]
        });
        console.log("Turkey");

        // let the other guys do their thing
        this.message.loadLayout.publish(null);

    }

    public reloadLayout(): void {
        // Let the other guys prepare
        this.message.prepareReloadLayout.publish(null);
        this.loadLayout();
    }
}
