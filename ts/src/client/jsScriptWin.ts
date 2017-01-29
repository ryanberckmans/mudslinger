import {JsScript} from "./jsScript";

declare let CodeMirror: any;

export class JsScriptWin {
    private win: any = null;
    private codeMirror: any = null;
    private runButton: any = null;

    constructor(private jsScript: JsScript) {
    }

    private handleRunButtonClick() {
        let code_text = this.codeMirror.getValue();
        let script = this.jsScript.makeScript(code_text);
        if (script) { script(); };
    };

    private getElements() {
        this.win = $("#win_js_script");
        this.runButton = $("#win_js_script_run_button");
    };

    private createWindow() {
        this.getElements();

        this.win.jqxWindow({width: 600, height: 400});
        this.codeMirror = CodeMirror.fromTextArea(
            document.getElementById("win_js_script_code"),
            {
                mode: "javascript",
                theme: "neat",
                autoRefresh: true, // https://github.com/codemirror/CodeMirror/issues/3098
                matchBrackets: true,
                lineNumbers: true
            }
        );

        this.runButton.click(this.handleRunButtonClick.bind(this));

    };

    public show() {
        if (!this.win) {
            this.createWindow();
        }

        this.win.jqxWindow("open");
    };
}
