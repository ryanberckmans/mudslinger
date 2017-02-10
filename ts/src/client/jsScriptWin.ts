import {JsScript} from "./jsScript";

declare let CodeMirror: any;

export class JsScriptWin {
    private $win: JQuery;
    private codeMirror: any = null;
    private $runButton: JQuery;

    constructor(private jsScript: JsScript) {
        let win = document.createElement("div");
        win.style.display = "none";
        win.className = "winJsScript";
        document.body.appendChild(win);

        win.innerHTML = `
        <!--header-->
        <div>JAVASCRIPT SCRIPT</div>
        <!--content-->
        <div>
            <button class="winJsScript-btnRun" style="height:10%">RUN SCRIPT</button>
            <div style="height:90%">
                <textarea class="winJsScript-code"></textarea>
            </div>
        </div>
        `;

        this.$win = $(win);
        this.$runButton = $(win.getElementsByClassName("winJsScript-btnRun")[0]);

        (<any>this.$win).jqxWindow({width: 600, height: 400});
        this.codeMirror = CodeMirror.fromTextArea(
            win.getElementsByClassName("winJsScript-code")[0], {
                mode: "javascript",
                theme: "neat",
                autoRefresh: true, // https://github.com/codemirror/CodeMirror/issues/3098
                matchBrackets: true,
                lineNumbers: true
            }
        );

        this.$runButton.click(this.handleRunButtonClick.bind(this));
    }

    private handleRunButtonClick() {
        let code_text = this.codeMirror.getValue();
        let script = this.jsScript.makeScript(code_text);
        if (script) { script(); };
    }

    public show() {
        (<any>this.$win).jqxWindow("open");
    }
}
