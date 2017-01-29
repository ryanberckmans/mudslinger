import {Message, MsgDef} from "./message";

function makeScript(text: string, _message_: Message) {
    let _scriptFunc_: (match: any) => void;
    /* Scripting API section */
    let send = function(cmd: string) {
        _message_.scriptSendCommand.publish({value: cmd});
    };

    let print = function(message: string) {
        _message_.scriptPrint.publish({value: message});
    };
    /* end Scripting API section */

    try {
        eval("_scriptFunc_ = function(match) {\"use strict\";" + text + "}");
    }
    catch (err) {
        _message_.scriptEvalError.publish({value: err});
        return null;
    }

    _scriptFunc_.bind(this);

    return _scriptFunc_;
}

export class JsScript {
    private scriptThis = {}; /* this used for all scripts */

    constructor(private message: Message) {
        this.message = message;
    }

    public makeScript(text: string) {
        return makeScript.call(this.scriptThis, text, this.message);
    }
}