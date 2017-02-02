import { Telnet, NegotiationData, Cmd, CmdName, Opt, OptName } from "./telnetlib";
import { EventHook } from "./event";


const TTYPES: string[] = [
    "ArcWeb",
    "ANSI",
    "-256color"
];


export class TelnetClient extends Telnet {
    public EvtServerEcho = new EventHook<boolean>();
    public EvtMsdpVar = new EventHook<[MsdpVarName, MsdpVal]>();

    public clientIp: string;
    
    private ttypeIndex: number = 0;

    constructor(writeFunc: (data: ArrayBuffer) => void) {
        super(writeFunc);

        this.EvtNegotiation.handle((data) => { this.onNegotiation(data); });
    }

    private onNegotiation(data: NegotiationData) {
        let {cmd, opt} = data;
        //console.log(CmdName(cmd), OptName(opt));

        if (cmd === Cmd.WILL) {
            if (opt === Opt.ECHO) {
                this.EvtServerEcho.fire(true);
            } else if (opt === ExtOpt.MSDP) {
                this.writeArr([Cmd.IAC, Cmd.DO, ExtOpt.MSDP]);
                this.writeMsdpVar("CLIENT_ID", "ArcWeb");

                for (let varName of SupportedMsdpVars) {
                    this.writeMsdpVar("REPORT", varName);
                }
            } else {
                this.writeArr([Cmd.IAC, Cmd.DONT, opt]);
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
            } else {
                this.writeArr([Cmd.IAC, Cmd.WONT, opt]);
            }
        } else if (cmd === Cmd.SE) {
            let sb = this.readSbArr();

            if (sb.length < 1) {
                return;
            }

            if (sb.length === 2 && sb[0] === Opt.TTYPE && sb[1] === SubNeg.SEND) {
                let ttype: string;
                if (this.ttypeIndex >= TTYPES.length) {
                    ttype = this.clientIp || "UNKNOWNIP";
                } else {
                    ttype = TTYPES[this.ttypeIndex];
                    this.ttypeIndex++;
                }
                this.writeArr( ([Cmd.IAC, Cmd.SB, Opt.TTYPE, SubNeg.IS]).concat(
                    arrayFromString(ttype),
                    [Cmd.IAC, Cmd.SE]
                ));
            } else if (sb[0] === ExtOpt.MSDP) {
                let result = ParseMsdp(sb.slice(1));
                this.EvtMsdpVar.fire(result);
            }
        }
    }

    private writeMsdpVar(varName: string, value: string) {
        this.writeArr([Cmd.IAC, Cmd.SB, ExtOpt.MSDP, MsdpDef.VAR].concat(
            arrayFromString(varName),
            [MsdpDef.VAL],
            arrayFromString(value),
            [Cmd.IAC, Cmd.SE]
        ));
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

const SupportedMsdpVars: string[] = [
    "CHARACTER_NAME",
    "HEALTH", "HEALTH_MAX",
    "MANA", "MANA_MAX",
    "MOVEMENT", "MOVEMENT_MAX",
    "EXPERIENCE_TNL", "EXPERIENCE_MAX",
    "OPPONENT_HEALTH", "OPPONENT_HEALTH_MAX",
    "OPPONENT_NAME",
    "STR", "STR_PERM",
    "CON", "CON_PERM",
    "VIT", "VIT_PERM",
    "AGI", "AGI_PERM",
    "DEX", "DEX_PERM",
    "INT", "INT_PERM",
    "WIS", "WIS_PERM",
    "DIS", "DIS_PERM",
    "CHA", "CHA_PERM",
    "LUC", "LUC_PERM",
    "ROOM_NAME", "ROOM_EXITS", "ROOM_VNUM", "ROOM_SECTOR",
    "EDIT_MODE", "EDIT_VNUM",
    "AFFECTS"
]

function arrayFromString(str: string) {
    let arr = new Array(str.length);
    for (let i=0; i < arr.length; i++) {
        arr[i] = str.charCodeAt(i);
    }

    return arr;
}