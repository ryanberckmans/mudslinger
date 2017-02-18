import * as Util from "./util";

declare let CodeMirror: any;

export interface TrigAlItem {
    pattern: string;
    value: string;
    regex: boolean;
    is_script: boolean;
}

export abstract class TrigAlEditBase {
    protected $win: JQuery;

    protected $listBox: JQuery;
    protected $pattern: JQuery;
    protected $regexCheckbox: JQuery;
    protected $scriptCheckbox: JQuery;
    protected $textArea: JQuery;
    protected $scriptArea: JQuery;
    protected codeMirror: any;
    protected $codeMirrorWrapper: JQuery;
    protected $newButton: JQuery;
    protected $deleteButton: JQuery;
    protected $mainSplit: JQuery;
    protected $saveButton: JQuery;
    protected $cancelButton: JQuery;

    /* these need to be overridden */
    protected abstract getList(): Array<string>;
    protected abstract getItem(ind: number): TrigAlItem;
    protected abstract saveItem(ind: number, pattern: string, value: string, checked: boolean, is_script: boolean): void;
    protected abstract deleteItem(ind: number): void;

    protected abstract get defaultPattern(): string;
    protected abstract get defaultValue(): string;
    protected abstract get defaultScript(): string;

    constructor(title: string) {
        let myDiv = document.createElement("div");
        myDiv.style.display = "none";
        document.body.appendChild(myDiv);
        this.$win = $(myDiv);
        myDiv.innerHTML = `
        <!--header-->
        <div>${title}</div>
        <!--content-->
        <div>
            <div class="winEdit-mainSplit">
                <!--left panel-->
                <div>
                    <div style="height:5%">
                        <button class="winEdit-btnNew">NEW</button>
                        <button class="winEdit-btnDelete">DELETE</button>
                    </div>
                    <select class="winEdit-listBox" size="100%" style="height:95%"></select>
                </div>
                <!--right panel-->
                <div>
                    Pattern:<br>
                    <input type="text" class="winEdit-pattern" style="height:5%" disabled><br>
                    Regex<br>
                    <input type="checkbox" class="winEdit-chkRegex" style="height:5%" disabled><br>
                    Script<br>
                    <input type="checkbox" class="winEdit-chkScript" style="height:5%" disabled>
                    <div>
                        <button class="winEdit-btnSave" style="height:5%" disabled>SAVE</button>
                        <button class="winEdit-btnCancel" style="height:5%" disabled>CANCEL</button>
                    </div>
                    Value:<br>
                    <div style="height:50%;width:100%">
                        <textarea class="winEdit-textArea" style="height:100%;width:100%" disabled></textarea>
                        <textarea class="winEdit-scriptArea" style="height:100%;width:100%" disabled></textarea>
                    </div>
                </div>
            </div>
        </div>
        `;

        this.$mainSplit = $(myDiv.getElementsByClassName("winEdit-mainSplit")[0]);
        this.$newButton = $(myDiv.getElementsByClassName("winEdit-btnNew")[0]);
        this.$deleteButton = $(myDiv.getElementsByClassName("winEdit-btnDelete")[0]);
        this.$listBox = $(myDiv.getElementsByClassName("winEdit-listBox")[0]);
        this.$pattern = $(myDiv.getElementsByClassName("winEdit-pattern")[0]);
        this.$regexCheckbox = $(myDiv.getElementsByClassName("winEdit-chkRegex")[0]);
        this.$scriptCheckbox = $(myDiv.getElementsByClassName("winEdit-chkScript")[0]);
        this.$saveButton = $(myDiv.getElementsByClassName("winEdit-btnSave")[0]);
        this.$cancelButton = $(myDiv.getElementsByClassName("winEdit-btnCancel")[0]);
        this.$textArea = $(myDiv.getElementsByClassName("winEdit-textArea")[0]);
        this.$scriptArea = $(myDiv.getElementsByClassName("winEdit-scriptArea")[0]);


        (<any>this.$win).jqxWindow({width: 600, height: 400});

        (<any>this.$mainSplit).jqxSplitter({
            width: "100%",
            height: "100%",
            orientation: "vertical",
            panels: [{size: "25%"}, {size: "75%"}]
        });

        this.codeMirror = CodeMirror.fromTextArea(
            this.$scriptArea[0], {
                mode: "javascript",
                theme: "neat",
                autoRefresh: true, // https://github.com/codemirror/CodeMirror/issues/3098
                matchBrackets: true,
                lineNumbers: true
            }
        );
        this.$codeMirrorWrapper = $(this.codeMirror.getWrapperElement());
        this.$codeMirrorWrapper.height("100%");
        this.$codeMirrorWrapper.hide();

        this.$listBox.change(this.handleListBoxChange.bind(this));
        this.$newButton.click(this.handleNewButtonClick.bind(this));
        this.$deleteButton.click(this.handleDeleteButtonClick.bind(this));
        this.$saveButton.click(this.handleSaveButtonClick.bind(this));
        this.$cancelButton.click(this.handleCancelButtonClick.bind(this));
        this.$scriptCheckbox.change(this.handleScriptCheckboxChange.bind(this));

    }

    private setEditorDisabled(state: boolean): void {
        this.$pattern.prop("disabled", state);
        this.$regexCheckbox.prop("disabled", state);
        this.$scriptCheckbox.prop("disabled", state);
        this.$textArea.prop("disabled", state);
        this.$codeMirrorWrapper.prop("disabled", state);
        this.$saveButton.prop("disabled", state);
        this.$cancelButton.prop("disabled", state);
    }

    private selectNone(): void {
        this.$listBox.prop("selectedItem", 0);
        this.$listBox.val([]);
    }

    private clearEditor(): void {
        this.$pattern.val("");
        this.$textArea.val("");
        this.$regexCheckbox.prop("checked", false);
        this.$scriptCheckbox.prop("checked", false);
    }

    private updateListBox() {
        let lst = this.getList();
        let html = "";
        for (let i = 0; i < lst.length; i++) {
            html += "<option>" + Util.rawToHtml(lst[i]) + "</option>";
        }
        this.$listBox.html(html);
    };

    private handleSaveButtonClick() {
        let ind = this.$listBox.prop("selectedIndex");
        let is_script = this.$scriptCheckbox.is(":checked");

        this.saveItem(
            ind,
            this.$pattern.val(),
            is_script ? this.codeMirror.getValue() : this.$textArea.val(),
            this.$regexCheckbox.is(":checked"),
            is_script
        );

        this.selectNone();
        this.clearEditor();
        this.setEditorDisabled(true);
        this.updateListBox();
    }

    private handleCancelButtonClick() {
        this.clearEditor();
        this.selectNone();
        this.setEditorDisabled(true);
    }

    private handleNewButtonClick() {
        this.setEditorDisabled(false);
        this.selectNone();
        this.$pattern.val(this.defaultPattern || "INPUT PATTERN HERE");
        this.$textArea.val(this.defaultValue || "INPUT VALUE HERE");
        this.codeMirror.setValue(this.defaultScript || "// INPUT SCRIPT HERE");
    }

    private handleDeleteButtonClick() {
        let ind = this.$listBox.prop("selectedIndex");

        this.deleteItem(ind);

        this.clearEditor();
        this.selectNone();
        this.setEditorDisabled(true);
        this.updateListBox();
    }

    private showScriptInput() {
        this.$textArea.hide();
        this.$codeMirrorWrapper.show();
        this.codeMirror.refresh();
    }

    private showTextInput() {
        this.$codeMirrorWrapper.hide();
        this.$textArea.show();
    }

    private handleListBoxChange() {
        let ind = this.$listBox.prop("selectedIndex");
        let item = this.getItem(ind);

        if (!item) {
            return;
        }
        this.setEditorDisabled(false);
        this.$pattern.val(item.pattern);
        if (item.is_script) {
            this.showScriptInput();
            this.codeMirror.setValue(item.value);
            this.$textArea.val("");
        } else {
            this.showTextInput();
            this.$textArea.val(item.value);
            this.codeMirror.setValue("");
        }
        this.$regexCheckbox.prop("checked", item.regex ? true : false);
        this.$scriptCheckbox.prop("checked", item.is_script ? true : false);
    }

    private handleScriptCheckboxChange() {
        let checked = this.$scriptCheckbox.prop("checked");
        if (checked) {
            this.showScriptInput();
        } else {
            this.showTextInput();
        }
    }

    public show() {
        this.updateListBox();

        (<any>this.$win).jqxWindow("open");
    }

    /* To be called if underlying data changes outside of this class logic (config import, for example) */
    protected onDataChange() {
        // if ((<any>this.$win).jqxWindow("isOpen")) {
            this.updateListBox();
        // }
    }
}
