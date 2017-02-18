import { GlEvent, EventHook } from "./event";

import { UserConfig } from "./userConfig";

import { JsScript } from "./jsScript";
import { TrigAlItem } from "./trigAlEditBase";


export class AliasManager {
    public evtAliasesChanged = new EventHook<void>();

    private enabled: boolean = true;
    public aliases: Array<TrigAlItem> = null;

    constructor(private jsScript: JsScript) {
        /* backward compatibility */
        let savedAliases: string = localStorage.getItem("aliases");
        if (savedAliases) {
            UserConfig.set("aliases", JSON.parse(savedAliases));
            localStorage.removeItem("aliases");
        }

        this.loadAliases();

        GlEvent.setAliasesEnabled.handle(this.handleSetAliasesEnabled, this);
        UserConfig.evtConfigImport.handle(this.handleConfigImport, this);
    }

    public saveAliases() {
        UserConfig.set("aliases", this.aliases);
    }

    private loadAliases() {
        this.aliases = UserConfig.get("aliases") || [];
    }

    private handleConfigImport(imp: {[k: string]: any}) {
        this.aliases = this.aliases.concat(imp["aliases"] || []);
        this.saveAliases();
        this.evtAliasesChanged.fire(null);
    }

    private handleSetAliasesEnabled(value: boolean) {
        this.enabled = value;
    }

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
