export class EventHook<TData> {
    private handlers: Array<[(data: TData) => void, any]> = [];
    
    public handle(callback: (data: TData) => void, context?: any) {
        this.handlers.push([callback, context]);
    }

    public fire(data: TData): boolean {
        if (this.handlers.length < 1) {
            return false;
        }

        for (let [cb, context] of this.handlers) {
            cb.call(context, data);
        }

        return true;
    }
}

export namespace GlEvent {
    export const msdpVar = new EventHook<GlDef.MsdpVarData>();
    export const loadLayout = new EventHook<GlDef.LoadLayoutData>();
    export const prepareReloadLayout = new EventHook<GlDef.PrepareReloadLayoutData>();
    export const setAliasesEnabled = new EventHook<GlDef.SetAliasesEnabledData>();
    export const setTriggersEnabled = new EventHook<GlDef.SetTriggersEnabledData>();
    export const setEcho = new EventHook<GlDef.SetEchoData>();
    export const telnetConnect = new EventHook<GlDef.TelnetConnectData>();
    export const telnetDisconnect = new EventHook<GlDef.TelnetDisconnectData>();
    export const telnetError = new EventHook<GlDef.TelnetErrorData>();
    export const sendCommand = new EventHook<GlDef.SendCommandData>();
    export const aliasSendCommands = new EventHook<GlDef.AliasSendCommandsData>();
    export const sendPw = new EventHook<GlDef.SendPwData>();
    export const scriptSendCommand = new EventHook<GlDef.ScriptSendCommandData>();
    export const triggerSendCommands = new EventHook<GlDef.TriggerSendCommandsData>();
    export const scriptSend = new EventHook<GlDef.ScriptSendData>();
    export const scriptPrint = new EventHook<GlDef.ScriptPrintData>();
    export const scriptEvalError = new EventHook<GlDef.ScriptEvalErrorData>();
    export const scriptExecError = new EventHook<GlDef.ScriptExecErrorData>();
    export const changeDefaultColor = new EventHook<GlDef.ChangeDefaultColorData>();
    export const wsError = new EventHook<GlDef.WsErrorData>();
    export const wsConnect = new EventHook<GlDef.WsConnectData>();
    export const wsDisconnect = new EventHook<GlDef.WsDisconnectData>();
    export const mxpTag = new EventHook<GlDef.MxpTagData>();
}

export namespace GlDef {
    export type LoadLayoutData = void;
    export type PrepareReloadLayoutData = void;
    export type TelnetConnectData = void;
    export type TelnetDisconnectData = void;
    export type WsErrorData = void;
    export type WsConnectData = void;
    export type WsDisconnectData = void;
    export type ScriptSendData = string;
    export interface MsdpVarData {
        varName: string;
        value: any;
    }
    export type SetEchoData = boolean;
    export type SetAliasesEnabledData = boolean;
    export type SetTriggersEnabledData = boolean;
    export type SendPwData = string;
    export interface SendCommandData {
        value: string;
        noPrint?: boolean;
    }
    export interface AliasSendCommandsData {
        orig: string;
        commands: string[];
    }
    export interface ScriptSendCommandData {
        value: string;
        noPrint?: boolean;
    }
    export type TriggerSendCommandsData = string[];
    export type ScriptPrintData = string;
    export type ScriptEvalErrorData = {};
    export type ScriptExecErrorData = {};
    export type ChangeDefaultColorData = string;
    export type MxpTagData = string;
    export type TelnetErrorData = string;
}