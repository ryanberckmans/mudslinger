/// <reference path="../../definitions/polyfill.d.ts" />

import { GlEvent } from "./event";
import { UserConfig } from "./userConfig";
import { AppInfo } from "./appInfo";

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
import { TriggerEditor } from "./triggerEditor";
import { TriggerManager } from "./triggerManager";
import { AboutWin } from "./aboutWin";

export class Client {
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
    private triggerEditor: TriggerEditor;
    private triggerManager: TriggerManager;
    private aboutWin: AboutWin;

    constructor() {
        this.loadLayout();

        this.aboutWin = new AboutWin();
        this.jsScript = new JsScript();
        this.chatWin = new ChatWin();
        this.gaugeWin = new GaugeWin();
        this.mapWin = new MapWin();

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
        this.menuBar = new MenuBar(this, this.socket, this.aliasEditor, this.triggerEditor, this.jsScriptWin, this.aboutWin);

        // Prevent navigating away accidentally
        window.onbeforeunload = () => {
            return "";
        };

        this.socket.open();
        this.socket.openTelnet();
    }

    private loadLayout() {
        (<any>$("#mainVertSplit")).jqxSplitter({
            width: "100%",
            height: "100%",
            orientation: "vertical",
            panels: [{size: "75%"}, {size: "25%"}]
        });
    }

    public readonly UserConfig = UserConfig;
    public readonly AppInfo = AppInfo;
}

