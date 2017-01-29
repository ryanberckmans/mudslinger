import {Message, MsgDef} from "./message";

export class StatWin {
    constructor(private message: Message) {
        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
        this.message.msdpVar.subscribe(this.handleMsdpVar, this);
    }

    private msdpVals: {[k: string]: string} = {
        "STR": null, "STR_PERM": null,
        "INT": null, "INT_PERM": null,
        "CON": null, "CON_PERM": null,
        "WIS": null, "WIS_PERM": null,
        "VIT": null, "VIT_PERM": null,
        "DIS": null, "DIS_PERM": null,
        "AGI": null, "AGI_PERM": null,
        "CHA": null, "CHA_PERM": null,
        "DEX": null, "DEX_PERM": null,
        "LUC": null, "LUC_PERM": null
    };

    private html: string;

    private prepareReloadLayout() {
        this.html = $("#win_stat").html();
    };

    private loadLayout() {
        if (this.html) {
            // it"s a reload
            $("#win_stat").html(this.html);
            this.html = null;
        }
    };

    private updateStatWin() {
        let output = "";
        output +=
        output += "<h2>STATS</h2>";

        let left = false;

        let print_stat = (label: string, val: string, perm: string) => {
            let color;
            left = !left;
            if (left) {
                color = "red";
            } else {
                color = "cyan";
            }

            output += "<span style=\"color: " + color + ";\">";

            output += label + ": ";
            output += ("   " + (this.msdpVals[perm] || "???")).slice(-3);
            output += "(" + (("   " + (this.msdpVals[val] || "???")).slice(-3)) + ")";

            output += "</span>";
        };

        output += "<center>";

        print_stat( "Str", "STR", "STR_PERM");
        output += "   ";
        print_stat( "Int", "INT", "INT_PERM");
        output += "<br>";

        print_stat( "Con", "CON", "CON_PERM");
        output += "   ";
        print_stat( "Wis", "WIS", "WIS_PERM");
        output += "<br>";

        print_stat( "Vit", "VIT", "VIT_PERM");
        output += "   ";
        print_stat( "Dis", "DIS", "DIS_PERM");
        output += "<br>";

        print_stat( "Agi", "AGI", "AGI_PERM");
        output += "   ";
        print_stat( "Cha", "CHA", "CHA_PERM");
        output += "<br>";

        print_stat( "Dex", "DEX", "DEX_PERM");
        output += "   ";
        print_stat( "Luc", "LUC", "LUC_PERM");
        output += "<br>";

        output += "</center>";

        $("#win_stat").html("<pre>" + output + "</pre>");
    };

    private handleMsdpVar(data: MsgDef.MsdpVarMsg) {
        if (!(data.varName in this.msdpVals)) {
            return;
        }

        this.msdpVals[data.varName] = data.value;

        this.updateStatWin();
    };
}
