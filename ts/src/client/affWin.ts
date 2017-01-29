import { GlEvent, GlDef } from "./event";

export class AffWin {
    private output: string;

    constructor() {
        GlEvent.msdpVar.handle(this.handleMsdpVar, this);
        GlEvent.prepareReloadLayout.handle(this.prepareReloadLayout, this);
        GlEvent.loadLayout.handle(this.loadLayout, this);
    }

    private prepareReloadLayout() {
        // nada
    }

    private loadLayout(): void {
        console.log(this);
        if (this.output) {
            // it"s a reload
            $("#win_aff").html(this.output);
        } else {
            this.showAffects({});
        }
    }

    private showAffects(affects: {[k: string]: string}) {
        this.output = "<h2>AFFECTS</h2>";

        for (let key in affects) {
            this.output += ("   " + affects[key]).slice(-3) + " : " + key + "<br>";
        }

        $("#win_aff").html(this.output);
    };

    private handleMsdpVar(data: GlDef.MsdpVarData) {
        if (data.varName !== "AFFECTS") {
            return;
        }
        let val: {[k: string]: string};
        if (data.value === "") {
            val = {};
        } else {
            val = data.value;
        }
        this.showAffects(val);
    };

}
