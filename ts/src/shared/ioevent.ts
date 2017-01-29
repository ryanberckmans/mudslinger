export module EvtDef {
    export interface TelnetData {
        value: ArrayBuffer;
    }
    export interface TelnetClosed {
        had_error: boolean;
    }
    export interface TelnetOpened {
    }
    export interface ReqTelnetWrite {
        data: ArrayBuffer;
    }
    export interface ReqSendCommand {
        value: string;
    }
}