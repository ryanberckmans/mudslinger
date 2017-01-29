import {Message, MsgDef} from "./message";

export class AffWin {
    private output: string;

    constructor(private message: Message) {
        this.message.msdpVar.subscribe(this.handleMsdpVar, this);
        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
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

    private handleMsdpVar(data: MsgDef.MsdpVarMsg) {
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
