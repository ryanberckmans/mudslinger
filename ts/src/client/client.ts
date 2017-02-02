/// <reference path="../../definitions/polyfill.d.ts" />

import { GlEvent } from "./event";

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

    private divMyCont: HTMLDivElement;
    private preWinOutput: HTMLPreElement;
    private divCmdInput: HTMLDivElement;
    private divWinMap : HTMLDivElement;
    private divWinGauge: HTMLDivElement;
    private divLeftPanel: HTMLDivElement;
    private divRightPanel: HTMLDivElement;
    private preWinChat: HTMLPreElement;
    private divMenuBar: HTMLDivElement;
    private divMainVertSplit: HTMLDivElement;

    constructor(cont: HTMLDivElement) {
        this.divMyCont = cont;

        this.loadLayout();

        this.jsScript = new JsScript();
        this.chatWin = new ChatWin(this.preWinChat);
        this.gaugeWin = new GaugeWin(this.divWinGauge);
        this.mapWin = new MapWin(this.divWinMap);
        
        this.jsScriptWin = new JsScriptWin(this.jsScript);
        this.triggerManager = new TriggerManager(this.jsScript);
        this.aliasManager = new AliasManager(this.jsScript);

        this.commandInput = new CommandInput(
            this.divCmdInput,
            this.aliasManager);

        this.outputWin = new OutputWin(
            this.preWinOutput,
            this.triggerManager);

        this.aliasEditor = new AliasEditor(this.aliasManager);
        this.triggerEditor = new TriggerEditor(this.triggerManager);

        this.outputManager = new OutputManager(this.outputWin);

        this.mxp = new Mxp(this.outputManager, this.chatWin);
        this.socket = new Socket(this.outputManager, this.mxp);
        this.menuBar = new MenuBar(
            this.divMenuBar,
            this, this.socket, this.aliasEditor, this.triggerEditor, this.jsScriptWin);

        // Prevent navigating away accidentally
        window.onbeforeunload = () => {
            return "";
        };

        this.socket.open();
        this.socket.openTelnet();
    }

    private htmlBase: string;

    private loadLayout() {
        this.divMyCont.innerHTML = `
        <div class="client-menuBar"></div>
        <div class="client-mainVertSplit">
            <div>
                <div class="client-leftPanel">
                    <pre class="client-winOutput"></pre>
                    <div class="client-cmdInput"></div>
                </div>
            </div>
            <div>
                <div class="client-rightPanel">
                    <div class="client-winMap"></div>
                    <div class="client-winGauge"></div>
                    <pre class="client-winChat"></pre>
                </div>
            </div>
        </div>
        `;

        this.divMyCont.style.width = "95vw";
        this.divMyCont.style.height = "92vh";

        this.divMenuBar = this.divMyCont.getElementsByClassName("client-menuBar")[0] as HTMLDivElement;
        this.divMainVertSplit = this.divMyCont.getElementsByClassName("client-mainVertSplit")[0] as HTMLDivElement;
        this.divLeftPanel = this.divMyCont.getElementsByClassName("client-leftPanel")[0] as HTMLDivElement;
        this.preWinOutput = this.divMyCont.getElementsByClassName("client-winOutput")[0] as HTMLPreElement;
        this.divCmdInput = this.divMyCont.getElementsByClassName("client-cmdInput")[0] as HTMLDivElement;
        this.divRightPanel = this.divMyCont.getElementsByClassName("client-rightPanel")[0] as HTMLDivElement;
        this.divWinMap = this.divMyCont.getElementsByClassName("client-winMap")[0] as HTMLDivElement;
        this.divWinGauge = this.divMyCont.getElementsByClassName("client-winGauge")[0] as HTMLDivElement;
        this.preWinChat = this.divMyCont.getElementsByClassName("client-winChat")[0] as HTMLPreElement;

        this.divLeftPanel.style.width = "100%";
        this.divLeftPanel.style.height = "100%";

        this.divCmdInput.style.width = "100%";
        this.divCmdInput.style.margin = "0";
        this.divCmdInput.style.padding = "0";
        this.divCmdInput.style.height = "20px";

        this.divRightPanel.style.display = "flex";
        this.divRightPanel.style.flexDirection = "column";
        this.divRightPanel.style.height = "100%";


        (<any>$(this.divMyCont.getElementsByClassName("client-mainVertSplit")[0])).jqxSplitter({
            width: "100%",
            height: "100%",
            orientation: "vertical",
            panels: [{size: "75%"}, {size: "25%"}]
        });

    }
}
