import {JsScript} from "./jsScript";
import {Message, MsgDef} from "./message";
import {TrigAlItem} from "./trigAlEditBase";

export class AliasManager {
    private enabled: boolean = true;
    public aliases: Array<TrigAlItem> = null;

    constructor(private message: Message, private jsScript: JsScript) {
        this.message.setAliasesEnabled.subscribe(this.handleSetAliasesEnabled, this);

        $(document).ready(() => {
            let saved_aliases: string = localStorage.getItem("aliases");
            if (!saved_aliases) {
                this.aliases = [];
            } else {
                this.aliases = JSON.parse(saved_aliases);
            }
        });
    }

    public saveAliases() {
        localStorage.setItem("aliases", JSON.stringify(this.aliases));
    };

    private handleSetAliasesEnabled(data: MsgDef.SetAliasesEnabledMsg) {
        this.enabled = data.value;
    };

    // return the result of the alias if any (string with embedded lines)
    // return true if matched and script ran
    // return null if no match
    public checkAlias(cmd: string): boolean | string {
        if (!this.enabled) return null;

        for (let i = 0; i < this.aliases.length; i++) {
            let alias = this.aliases[i];

            if (alias.regex) {
                let re = alias.pattern;
                let match = cmd.match(re);
                if (!match) {
                    continue;
                }

                if (alias.is_script) {
                    let script = this.jsScript.makeScript(alias.value);
                    if (script) { script.RunScript(match); };
                    return true;
                } else {
                    let value = alias.value;

                    value = value.replace(/\$(\d+)/g, function(m, d) {
                        return match[parseInt(d)] || "";
                    });
                    return value;
                }
            } else {
                let re = "^" + alias.pattern + "\\s*(.*)$";
                let match = cmd.match(re);
                if (!match) {
                    continue;
                }

                if (alias.is_script) {
                    let script = this.jsScript.makeScript(alias.value);
                    if (script) { script(); };
                    return true;
                } else {
                    let value = alias.value.replace("$1", match[1] || "");
                    return value;
                }
            }
        }
        return null;
    };
}
