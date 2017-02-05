import { GlEvent, GlDef } from "./event";

import { JsScript } from "./jsScript";
import { TrigAlItem } from "./trigAlEditBase";

export class TriggerManager {
    private enabled: boolean = true;
    public triggers: Array<TrigAlItem> = null;

    constructor(private jsScript: JsScript) {
        $(document).ready(() => {
            let saved_triggers = localStorage.getItem("triggers");
            if (!saved_triggers) {
                this.triggers = [];
            } else {
                this.triggers = JSON.parse(saved_triggers);
            }
        });

        GlEvent.setTriggersEnabled.handle(this.handleSetTriggersEnabled, this);
    }

    public saveTriggers() {
        localStorage.setItem("triggers", JSON.stringify(this.triggers));
    }

    private handleSetTriggersEnabled(data: GlDef.SetTriggersEnabledData) {
        this.enabled = data;
    }

    public handleLine(line: string) {
        if (!this.enabled) return;
//        console.log("TRIGGER: " + line);
        for (let i = 0; i < this.triggers.length; i++) {
            let trig = this.triggers[i];
            if (trig.regex) {
                let match = line.match(trig.pattern);
                if (!match) {
                    continue;
                }

                if (trig.is_script) {
                    let script = this.jsScript.makeScript(trig.value);
                    if (script) { script(); };
                } else {
                    let value = trig.value;

                    value = value.replace(/\$(\d+)/g, function(m, d) {
                        return match[parseInt(d)] || "";
                    });

                    let cmds = value.replace("\r", "").split("\n");
                    GlEvent.triggerSendCommands.fire(cmds);
                }
            } else {
                if (line.includes(trig.pattern)) {
                    if (trig.is_script) {
                        let script = this.jsScript.makeScript(trig.value);
                        if (script) { script(); };
                    } else {
                        let cmds = trig.value.replace("\r", "").split("\n");
                        GlEvent.triggerSendCommands.fire(cmds);
                    }
                }
            }
        }
    };
}

