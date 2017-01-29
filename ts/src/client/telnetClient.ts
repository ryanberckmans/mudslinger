import { Telnet, NegotiationData, Cmd, Opt } from "./telnetlib";
import { EventHook } from "./event";

export class TelnetClient extends Telnet {
    public EvtServerEcho = new EventHook<boolean>();
    public EvtMsdpVar = new EventHook<[MsdpVarName, MsdpVal]>();
    
    constructor(writeFunc: (data: ArrayBuffer) => void) {
        super(writeFunc);

        this.EvtNegotiation.handle((data) => { return this.onNegotiation(data); });
    }

    private onNegotiation (data: NegotiationData) {
        let {cmd, opt} = data;

        if (cmd === Cmd.WILL) {
            if (opt === Opt.ECHO) {

                this.EvtServerEcho.fire(true);
            } else if (opt === ExtOpt.MSDP) {
                this.writeArr([Cmd.IAC, Cmd.DO, ExtOpt.MSDP]);
            }
        } else if (cmd === Cmd.WONT) {
            if (opt === Opt.ECHO) {
                this.EvtServerEcho.fire(false);
            }
        } else if (cmd === Cmd.DO) {
            if (opt === Opt.TTYPE) {
                this.writeArr([Cmd.IAC, Cmd.WILL, Opt.TTYPE]);
            } else if (opt === ExtOpt.MXP) {
                this.writeArr([Cmd.IAC, Cmd.WILL, ExtOpt.MXP]);
            }
        } else if (cmd === Cmd.SE) {
            let sb = this.readSbArr();

            if (sb.length < 1) {
                return;
            }

            if (sb.length === 2 && sb[0] === Opt.TTYPE && sb[1] === SubNeg.SEND) {
                // TODO: handle the ttype cycling here
            } else if (sb[0] === ExtOpt.MSDP) {
                // TODO: parse MSDP
                let result = ParseMsdp(sb.slice(1));
                this.EvtMsdpVar.fire(result);
            }
        }
    }
}

export namespace ExtOpt {
    export const MSDP = 69;
    export const MCCP = 70;
    export const MSP = 90;
    export const MXP = 91;
    export const ATCP = 200;
}

export namespace SubNeg {
    export const IS = 0;
    export const SEND = 1;
    export const ACCEPTED = 2;
    export const REJECTED = 3;
}

type MsdpVarName = string;
type MsdpObj = {[k: string]: MsdpVal};
type MsdpArr = Array<any>;

type MsdpVal = string | MsdpArr | MsdpObj

function GetMsdpTable(data: Array<number>): [MsdpObj, number] {
    // skip first char which should be MSDP.TABLE_OPEN
    let i = 1;

    let rtn: MsdpVal = {};

    while (data[i] !== MsdpDef.TABLE_CLOSE) {
        let [k, v, j] = GetMsdpVar(data.slice(i));
        i += j;
        rtn[k] = v;
    }

    i += 1;
    return [rtn, i];
}


function GetMsdpArray(data: Array<number>): [MsdpArr, number] {
    // skip first char which should be MSDP.ARRAY_OPEN
    let i = 1;

    let rtn = [];
    while (data[i] !== MsdpDef.ARRAY_CLOSE) {
        let [val, j] = GetMsdpVal(data.slice(i));
        i += j;
        rtn.push(val);
    }

    i += 1;
    return [rtn, i];
}


function GetMsdpVal(data: Array<number>): [MsdpVal, number] {
    // skip first char which should be MSDP.VAL
    let i = 1;

    if (i >= data.length) {
        return ['', i];
    }

    if (data[i] === MsdpDef.ARRAY_OPEN) {
        let [rtn, j] = GetMsdpArray(data.slice(i));
        i += j;
        return [rtn, i];
    } else if (data[i] === MsdpDef.TABLE_OPEN) {
        let [rtn, j] = GetMsdpTable(data.slice(i));
        i += j;
        return [rtn, i];
    }

    // normal var
    let startInd = i;
    while (true) {
        if (i >= data.length) {
            break;
        }
        if ([MsdpDef.VAR, MsdpDef.VAL, MsdpDef.ARRAY_CLOSE, MsdpDef.TABLE_CLOSE].indexOf(data[i]) !== -1) {
            break;
        }
        i += 1;
    }
    let val = String.fromCharCode.apply(String, data.slice(startInd, i));

    return [val, i]
}

function GetMsdpVar(data: Array<number>): [MsdpVarName, MsdpVal, number] {
    // skip first char which should be MSDP.VAR
    let i = 1;

    while (data[i] !== MsdpDef.VAL) {
        i++;
    }

    let varName = String.fromCharCode.apply(String, data.slice(1, i));

    let [val, j] = GetMsdpVal(data.slice(i));

    i += j;

    return [varName, val, i];
}

export function ParseMsdp(data: Array<number>): [MsdpVarName, MsdpVal] {
    let [varName, val, i] = GetMsdpVar(data);

    return [varName, val];
}

export namespace MsdpDef {
    export const VAR = 1;
    export const VAL = 2;
    export const TABLE_OPEN = 3;
    export const TABLE_CLOSE = 4;
    export const ARRAY_OPEN = 5;
    export const ARRAY_CLOSE = 6;
}
