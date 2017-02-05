import { TrigAlEditBase } from "./trigAlEditBase";
import { TriggerManager } from "./triggerManager";

export class TriggerEditor extends TrigAlEditBase {
    constructor(private triggerManager: TriggerManager) {
        super("TRIGGERS");
    }

    protected defaultValue =
         "Put the trigger value here.\n"
        + "This can be 1 or more commands, including match parameters (e.g. $1) for regex triggers.\n\n"
        + "For regex triggers, use ${groupnum} to represent the matches from your regex pattern.\n"
        + "Example: Trigger pattern '(\\w+) has arrived.', trigger value 'say Hi $1', "
        + "then if 'Vodur has arrived' comes through, 'say hi Vodur' will be sent.";

    protected defaultScript =
         "/* Put the script here.\n"
        + "This is javascript code that will run when the trigger fires.\n"
        + "You are prevented from creating global variables.\n"
        + "Use 'var' keyword to create local variables.\n"
        + "Add values to the 'this' object to share persistent data between scripts.\n"
        + "Example: this.my_val = 123;\n"
        + "Every script that runs has the same 'this' object.\n"
        + "\n"
        + "Use the send() function to send commands to the mud. Example: send('kill orc');\n"
        + "For regex triggers, 'match' will be the javascript match array, with \n"
        + "indices according to match groups.\n";

    protected defaultPattern: string = null;

    protected getList() {
        let triggers = this.triggerManager.triggers;
        let lst = [];
        for (let i = 0; i < triggers.length; i++) {
            lst.push(triggers[i].pattern);
        }

        return lst;
    }

    protected getItem(ind: number) {
        let triggers = this.triggerManager.triggers;
        if (ind < 0 || ind >= triggers.length) {
            return null;
        } else {
            return triggers[ind];
        }
    }

    protected saveItem(ind: number, pattern: string, value: string, regex: boolean, is_script: boolean) {
        let trig = {
            pattern: pattern,
            value: value,
            regex: regex,
            is_script: is_script
        };
        if (ind < 0) {
            // New trigger
            this.triggerManager.triggers.push(trig);
        } else {
            // Update trigger
            this.triggerManager.triggers[ind] = trig;
        }
        this.triggerManager.saveTriggers();
    }

    protected deleteItem(ind: number) {
        this.triggerManager.triggers.splice(ind, 1);
        this.triggerManager.saveTriggers();
    }
}