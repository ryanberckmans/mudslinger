type CallbackFunc<TData> = (data: TData) => void;

class Callback<TData> {
    private func: CallbackFunc<TData>;
    private context: {};

    constructor(func: CallbackFunc<TData>, context: {}) {
        this.func = func;
        this.context = context;
    }

    public call(data: {}) {
        this.func.call(this.context, data);
    }
}

class MsgType<TData> {
    private subscribers: Callback<TData>[] = [];

    public subscribe(func: CallbackFunc<TData>, context: {}) {
        let cb = new Callback<TData>(func, context);
        this.subscribers.push(cb);
    }

    public publish(data: TData) {
        for (let cb of this.subscribers) {
            cb.call(data);
        }
    }
}

export class Message {
    public readonly msdpVar = new MsgType<MsgDef.MsdpVarMsg>();
    public readonly loadLayout = new MsgType<MsgDef.LoadLayoutMsg>();
    public readonly prepareReloadLayout = new MsgType<MsgDef.PrepareReloadLayoutMsg>();
    public readonly setAliasesEnabled = new MsgType<MsgDef.SetAliasesEnabledMsg>();
    public readonly setTriggersEnabled = new MsgType<MsgDef.SetTriggersEnabledMsg>();
    public readonly setEcho = new MsgType<MsgDef.SetEchoMsg>();
    public readonly telnetConnect = new MsgType<MsgDef.TelnetConnectMsg>();
    public readonly telnetDisconnect = new MsgType<MsgDef.TelnetDisconnectMsg>();
    public readonly telnetError = new MsgType<MsgDef.TelnetErrorMsg>();
    public readonly sendCommand = new MsgType<MsgDef.SendCommandMsg>();
    public readonly aliasSendCommands = new MsgType<MsgDef.AliasSendCommandsMsg>();
    public readonly sendPw = new MsgType<MsgDef.SendPwMsg>();
    public readonly scriptSendCommand = new MsgType<MsgDef.ScriptSendCommandMsg>();
    public readonly triggerSendCommands = new MsgType<MsgDef.TriggerSendCommandsMsg>();
    public readonly scriptSend = new MsgType<MsgDef.ScriptSendMsg>();
    public readonly scriptPrint = new MsgType<MsgDef.ScriptPrintMsg>();
    public readonly scriptEvalError = new MsgType<MsgDef.ScriptEvalErrorMsg>();
    public readonly scriptExecError = new MsgType<MsgDef.ScriptExecErrorMsg>();
    public readonly changeDefaultColor = new MsgType<MsgDef.ChangeDefaultColorMsg>();
    public readonly wsError = new MsgType<MsgDef.WsErrorMsg>();
    public readonly wsConnect = new MsgType<MsgDef.WsConnectMsg>();
    public readonly wsDisconnect = new MsgType<MsgDef.WsDisconnectMsg>();
    public readonly mxpTag = new MsgType<MsgDef.MxpTagMsg>();
}

export namespace MsgDef {
    export interface LoadLayoutMsg {};
    export interface PrepareReloadLayoutMsg {};
    export interface TelnetConnectMsg {};
    export interface TelnetDisconnectMsg {};

    export interface WsErrorMsg {};
    export interface WsConnectMsg {};
    export interface WsDisconnectMsg {};
    export interface ScriptSendMsg {
        value: string;
    }
    export interface MsdpVarMsg {
        varName: string;
        value: any;
    }
    export interface SetEchoMsg {
        value: boolean;
    }
    export interface SetAliasesEnabledMsg {
        value: boolean;
    }
    export interface SetTriggersEnabledMsg {
        value: boolean;
    }
    export interface SendPwMsg {
        value: string;
    }
    export interface SendCommandMsg {
        value: string;
        noPrint?: boolean;
    }
    export interface AliasSendCommandsMsg {
        orig: string;
        commands: string[];
    }
    export interface ScriptSendCommandMsg {
        value: string;
        noPrint?: boolean;
    }
    export interface TriggerSendCommandsMsg {
        commands: string[];
    }
    export interface ScriptPrintMsg {
        value: string;
    }
    export interface ScriptEvalErrorMsg {
        value: {};
    }
    export interface ScriptExecErrorMsg {
        value: {};
    };
    export interface ChangeDefaultColorMsg {
        value: string;
    }
    export interface MxpTagMsg {
        value: string;
    }
    export interface TelnetErrorMsg {
        value: string;
    }
}
