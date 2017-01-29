import {AliasManager} from "./aliasManager";
import {TrigAlEditBase} from "./trigAlEditBase";

export class AliasEditor extends TrigAlEditBase {
    constructor(private aliasManager: AliasManager) {
        super();
    }

    protected defaultPattern: string = null;

    protected defaultValue: string = "Put the alias value here.\n"
            + "This can be 1 or more commands, including match parameters (e.g. $1).\n\n"
            + "For non-regex aliases, use $1 in the value to represent the full argument to the command.\n"
            + "Example: Alias pattern 'blah', alias value 'say $1', "
            + "then issue 'blah asadf dfdfa' and 'say asadf dfdfa' will be sent.\n\n"
            + "For regex aliases, use ${groupnum} to represent the matches from your regex pattern.\n"
            + "Example: Alias pattern 'blah (\\w+)', alias value 'say $1', "
            + "then issue 'blah asadf' and 'say asadf' will be sent.";

    protected defaultScript: string = "/* Put the script here.\n"
            + "This is javascript code that will run when the trigger fires.\n"
            + "You are prevented from creating global variables.\n"
            + "Use 'var' keyword to create local variables.\n"
            + "Add values to the 'this' object to share persistent data between scripts.\n"
            + "Example: this.my_val = 123;\n"
            + "Every script that runs has the same 'this' object.\n"
            + "\n"
            + "Use the send() function to send commands to the mud. Example: send('kill orc');\n"
            + "For regex aliases, 'match' will be the javascript match array, with \n"
            + "indices according to match groups.\n";

    protected getElements(): void {
        this.win = $("#win_alias_edit");
        this.listBox = $("#alias_list_box");
        this.pattern = $("#alias_pattern");
        this.regexCheckbox = $("#alias_regex_checkbox");
        this.scriptCheckbox = $("#alias_script_checkbox");
        this.textArea = $("#alias_text_area");
        this.scriptArea = $("#alias_script_area");
        this.newButton = $("#alias_new_button");
        this.deleteButton = $("#alias_delete_button");
        this.saveButton = $("#alias_save_button");
        this.cancelButton = $("#alias_cancel_button");
        this.mainSplit = $("#alias_main_split");
    };

    protected getList() {
        let aliases = this.aliasManager.aliases;
        let lst = [];
        for (let i = 0; i < aliases.length; i++) {
            lst.push(aliases[i].pattern);
        }

        return lst;
    }

    protected getItem(ind: number) {
        let aliases = this.aliasManager.aliases;
        if (ind < 0 || ind >= aliases.length) {
            return null;
        } else {
            return aliases[ind];
        }
    }

    protected saveItem(ind: number, pattern: string, value: string, regex: boolean, is_script: boolean) {
        let alias = {
            pattern: pattern,
            value: value,
            regex: regex,
            is_script: is_script
        };
        if (ind < 0) {
            // New alias
            this.aliasManager.aliases.push(alias);
        } else {
            // Update alias
            this.aliasManager.aliases[ind] = alias;
        }
        this.aliasManager.saveAliases();
    }

    protected deleteItem(ind: number) {
        this.aliasManager.aliases.splice(ind, 1);
        this.aliasManager.saveAliases();
    }
}