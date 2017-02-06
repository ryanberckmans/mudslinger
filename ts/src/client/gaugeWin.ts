import { GlEvent, GlDef } from "./event";
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
    private $hpBar: JQuery;
    private $manaBar: JQuery;
    private $moveBar: JQuery;
    private $tnlBar: JQuery;
    private $enemyBar: JQuery;

    private msdpVals: MsdpVals = new MsdpVals();
    private updateFuncs: {[k: string]: () => void} = {};

    constructor() {
        this.$hpBar = $("#winGauge-hpBar");
        this.$manaBar = $("#winGauge-manaBar");
        this.$moveBar = $("#winGauge-moveBar");
        this.$tnlBar = $("#winGauge-tnlBar");
        this.$enemyBar = $("#winGauge-enemyBar");
        
        this.createUpdateFuncs();
        this.loadLayout();

        GlEvent.msdpVar.handle(this.handleMsdpVar, this);
        GlEvent.setGaugesEnabled.handle((value) => {
            if (value === true) {
                $("#winGauge").show();
            } else if (value === false) {
                $("#winGauge").hide();
            }
        });
    }

    private loadLayout() {
        (<any>this.$hpBar).jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                return renderGaugeText( this.msdpVals["HEALTH"] || 0, this.msdpVals["HEALTH_MAX"] || 0, "hp ");
            }
        });

        this.$hpBar.children(".jqx-progressbar-value").css(
            "background-color", "#DF0101");

        (<any>this.$manaBar).jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                return renderGaugeText( this.msdpVals["MANA"] || 0, this.msdpVals["MANA_MAX"] || 0, "mn ");
            }
        });
        this.$manaBar.children(".jqx-progressbar-value").css(
                "background-color", "#2E64FE");

        (<any>this.$moveBar).jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                return renderGaugeText( this.msdpVals["MOVEMENT"] || 0, this.msdpVals["MOVEMENT_MAX"] || 0, "mv ");
            }
        });
        this.$moveBar.children(".jqx-progressbar-value").css(
                "background-color", "#04B4AE");

        (<any>this.$enemyBar).jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 0,
            showText: true,
            animationDuration: 0,
            renderText: (tex: string) => {
                return Util.stripColorTags(this.msdpVals.OPPONENT_NAME || "");
            }
        });
        this.$enemyBar.children(".jqx-progressbar-value").css(
                "background-color", "purple");

        (<any>this.$tnlBar).jqxProgressBar({
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT,
            value: 50,
            showText: true,
            animationDuration: 0,
            renderText: (text: string) => {
                let tnl = this.msdpVals.EXPERIENCE_TNL || 0;
                let max = this.msdpVals.EXPERIENCE_MAX || 0;
                return renderGaugeText(max - tnl, max, "etl");
            }
        });
        this.$tnlBar.children(".jqx-progressbar-value").css(
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
            (<any>this.$hpBar).jqxProgressBar({value: 100 * val / max });
        };
        this.updateFuncs["HEALTH_MAX"] = this.updateFuncs["HEALTH"];

        this.updateFuncs["MANA"] = () => {
            let val = this.msdpVals["MANA"] || 0;
            let max = this.msdpVals["MANA_MAX"] || 0;
            if ( !max || max === 0) { return; }
            (<any>this.$manaBar).jqxProgressBar({value: 100 * val / max});
        };
        this.updateFuncs["MANA_MAX"] = this.updateFuncs["MANA"];

        this.updateFuncs["MOVEMENT"] = () => {
            let val = this.msdpVals["MOVEMENT"] || 0;
            let max = this.msdpVals["MOVEMENT_MAX"] || 0;
            if ( !max || max === 0) { return; }
            (<any>this.$moveBar).jqxProgressBar({value: 100 * val / max});
        };
        this.updateFuncs["MOVEMENT_MAX"] = this.updateFuncs["MOVEMENT"];

        this.updateFuncs["OPPONENT_HEALTH"] = () => {
            let val = this.msdpVals["OPPONENT_HEALTH"] || 0;
            let max = this.msdpVals["OPPONENT_HEALTH_MAX"] || 0;
            if ( !max || max === 0) { return; }
            (<any>this.$enemyBar).jqxProgressBar({value: 100 * val / max});
        };
        this.updateFuncs["OPPONENT_HEALTH_MAX"] = this.updateFuncs["OPPONENT_HEALTH"];
        this.updateFuncs["OPPONENT_NAME"] = this.updateFuncs["OPPONENT_HEALTH"];

        this.updateFuncs["EXPERIENCE_TNL"] = () => {
            let val = this.msdpVals["EXPERIENCE_TNL"] || 0;
            let max = this.msdpVals["EXPERIENCE_MAX"] || 0;
            if ( !max || max === 0) { return; }
            (<any>this.$tnlBar).jqxProgressBar({value: 100 * (max - val) / max});
        };
        this.updateFuncs["EXPERIENCE_MAX"] = this.updateFuncs["EXPERIENCE_TNL"];
    }

    private handleMsdpVar(data: GlDef.MsdpVarData) {
        if (data.varName in this.updateFuncs) {
            let dict: {[k: string]: any} = this.msdpVals;
            dict[data.varName] = data.value;
            this.updateFuncs[data.varName]();
        }
    }
}

function renderGaugeText(curr: number, max: number, tag: string) {
    let rtn = "<pre class=\"gaugeText\">"
        + ("     " + curr).slice(-5)
        + " / "
        + ("     " + max).slice(-5)
        + " "
        + tag
        + "</pre>";
    return rtn;
}
