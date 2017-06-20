import { Telnet, NegotiationData, Cmd, CmdName, Opt, OptName } from "./telnetlib";
import { EventHook } from "./event";


const TTYPES: string[] = [
    "Mudslinger",
    "ANSI",
    "-256color"
];


export class TelnetClient extends Telnet {
    public EvtServerEcho = new EventHook<boolean>();

    public clientIp: string;

    private ttypeIndex: number = 0;

    constructor(writeFunc: (data: ArrayBuffer) => void) {
        super(writeFunc);

        this.EvtNegotiation.handle((data) => { this.onNegotiation(data); });
    }

    private onNegotiation(data: NegotiationData) {
        let {cmd, opt} = data;
        // console.log(CmdName(cmd), OptName(opt));

        if (cmd === Cmd.WILL) {
            if (opt === Opt.ECHO) {
                this.EvtServerEcho.fire(true);
            } else if (opt === Opt.SGA) {
                this.writeArr([Cmd.IAC, Cmd.DO, Opt.SGA]);
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

function arrayFromString(str: string) {
    let arr = new Array(str.length);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = str.charCodeAt(i);
    }

    return arr;
}