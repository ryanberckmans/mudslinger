import { GlEvent, GlDef } from "./event";

function makeScript(text: string) {
    let _scriptFunc_: (match: any) => void;
    /* Scripting API section */
    let send = function(cmd: string) {
        GlEvent.scriptSendCommand.fire({value: cmd});
    };

    let print = function(message: string) {
       GlEvent.scriptPrint.fire(message);
    };
    /* end Scripting API section */

    try {
        eval("_scriptFunc_ = function(match) {\"use strict\";" + text + "}");
    }
    catch (err) {
        GlEvent.scriptEvalError.fire({value: err});
        return null;
    }

    _scriptFunc_.bind(this);

    return _scriptFunc_;
}

export class JsScript {
    private scriptThis = {}; /* this used for all scripts */

    public makeScript(text: string) {
        return makeScript.call(this.scriptThis, text);
    }
}