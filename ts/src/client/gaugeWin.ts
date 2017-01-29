import {Message, MsgDef} from "./message";
import * as Util from "./util";

const GAUGE_HEIGHT = "18%";
const GAUGE_WIDTH = "100%";

class MsdpVals {
    HEALTH: number;
    HEALTH_MAX: number;
    MANA: number;
    MANA_MAX: number;
    MOVEMENT: number;
    MOVEMENT_MAX: number;
    EXPERIENCE_TNL: number;
    EXPERIENCE_MAX: number;
    OPPONENT_HEALTH: number;
    OPPONENT_HEALTH_MAX: number;
    OPPONENT_NAME: string;
}


export class GaugeWin {
    private msdpVals: MsdpVals = new MsdpVals();
    private updateFuncs: {[k: string]: () => void} = {};

    constructor(private message: Message) {
        this.message = message;

        this.createUpdateFuncs();

        this.message.msdpVar.subscribe(this.handleMsdpVar, this);
        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
    }

    private renderGaugeText(curr: number, max: number, tag: string) {
        let rtn = "<pre class=\"gauge_text\">"
            + ("     " + curr).slice(-5)
            + " / "
            + ("     " + max).slice(-5)
            + " "
            + tag
            + "</pre>";
        return rtn;
    }

    private prepareReloadLayout() {
        // nada
    };

    private loadLayout() {
        $("#hp_bar").jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                return this.renderGaugeText( this.msdpVals["HEALTH"] || 0, this.msdpVals["HEALTH_MAX"] || 0, "hp ");
            }
        });

        $("#hp_bar .jqx-progressbar-value").css(
            "background-color", "#DF0101");

        $("#mana_bar").jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                return this.renderGaugeText( this.msdpVals["MANA"] || 0, this.msdpVals["MANA_MAX"] || 0, "mn ");
            }
        });
        $("#mana_bar .jqx-progressbar-value").css(
                "background-color", "#2E64FE");

        $("#move_bar").jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                return this.renderGaugeText( this.msdpVals["MOVEMENT"] || 0, this.msdpVals["MOVEMENT_MAX"] || 0, "mv ");
            }
        });
        $("#move_bar .jqx-progressbar-value").css(
                "background-color", "#04B4AE");

        $("#enemy_bar").jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 0,
            showText: true,
            animationDuration: 0,
            renderText: (tex: string) => {
                return Util.stripColorTags(this.msdpVals.OPPONENT_NAME || "");
            }
        });
        $("#enemy_bar .jqx-progressbar-value").css(
                "background-color", "purple");

        $("#tnl_bar").jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                let tnl = this.msdpVals.EXPERIENCE_TNL || 0;
                let max = this.msdpVals.EXPERIENCE_MAX || 0;
                return this.renderGaugeText(max - tnl, max, "etl");
            }
        });
        $("#tnl_bar .jqx-progressbar-value").css(
                "background-color", "#04B404");

        for (let k in this.updateFuncs) {
            this.updateFuncs[k]();
        }
    }

    private createUpdateFuncs() {
        this.updateFuncs["HEALTH"] = () => {
            let val = this.msdpVals["HEALTH"] || 0;
            let max = this.msdpVals["HEALTH_MAX"] || 0;
            if ( !max || max === 0) { return; }
            $("#hp_bar").jqxProgressBar({value: 100 * val / max });
        };
        this.updateFuncs["HEALTH_MAX"] = this.updateFuncs["HEALTH"];

        this.updateFuncs["MANA"] = () => {
            let val = this.msdpVals["MANA"] || 0;
            let max = this.msdpVals["MANA_MAX"] || 0;
            if ( !max || max === 0) { return; }
            $("#mana_bar").jqxProgressBar({value: 100 * val / max});
        };
        this.updateFuncs["MANA_MAX"] = this.updateFuncs["MANA"];

        this.updateFuncs["MOVEMENT"] = () => {
            let val = this.msdpVals["MOVEMENT"] || 0;
            let max = this.msdpVals["MOVEMENT_MAX"] || 0;
            if ( !max || max === 0) { return; }
            $("#move_bar").jqxProgressBar({value: 100 * val / max});
        };
        this.updateFuncs["MOVEMENT_MAX"] = this.updateFuncs["MOVEMENT"];

        this.updateFuncs["OPPONENT_HEALTH"] = () => {
            let val = this.msdpVals["OPPONENT_HEALTH"] || 0;
            let max = this.msdpVals["OPPONENT_HEALTH_MAX"] || 0;
            if ( !max || max === 0) { return; }
            $("#enemy_bar").jqxProgressBar({value: 100 * val / max});
        };
        this.updateFuncs["OPPONENT_HEALTH_MAX"] = this.updateFuncs["OPPONENT_HEALTH"];
        this.updateFuncs["OPPONENT_NAME"] = this.updateFuncs["OPPONENT_HEALTH"];

        this.updateFuncs["EXPERIENCE_TNL"] = () => {
            let val = this.msdpVals["EXPERIENCE_TNL"] || 0;
            let max = this.msdpVals["EXPERIENCE_MAX"] || 0;
            if ( !max || max === 0) { return; }
            $("#tnl_bar").jqxProgressBar({value: 100 * (max - val) / max});
        };
        this.updateFuncs["EXPERIENCE_MAX"] = this.updateFuncs["EXPERIENCE_TNL"];
    }

    private handleMsdpVar(data: MsgDef.MsdpVarMsg) {
        if (data.varName in this.updateFuncs) {
            let dict: {[k: string]: any} = this.msdpVals;
            dict[data.varName] = data.value;
            this.updateFuncs[data.varName]();
        }
    }
}
