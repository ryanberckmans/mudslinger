import { EventHook } from "./event";

export interface NegotiationData {
    cmd: number;
    opt: number;
}

export class Telnet {
    private iacSeq: number[] = [];
    private buf: Array<Array<number>> = [[], []];
    private sb: number = 0;

    constructor(writeFunc: (data: ArrayBuffer) => void) {
        this.writeFunc = writeFunc;
    }

    public EvtData = new EventHook<ArrayBuffer>();
    public EvtNegotiation = new EventHook<NegotiationData>();

    protected writeFunc: (data: ArrayBuffer) => void;
    protected writeBuff(data: ArrayBuffer): void {
        this.writeFunc(data);
    }
    protected writeArr(data: Array<number>): void {
        this.writeFunc(new Uint8Array(data).buffer);
    }

    public readSbBuff(): ArrayBuffer {
        let sbData = this.buf[1];
        this.buf[1] = [];
        return new Uint8Array(sbData).buffer;
    }

    public readSbArr(): Array<number> {
        let sb = this.buf[1];
        this.buf[1] = [];
        return sb;
    }

    public handleData(data: ArrayBuffer) {
        let view = new Uint8Array(data);
        let rxLen = view.length;

        for (let i = 0; i < rxLen; i++) {
            let c = view[i];

            if (this.iacSeq.length === 0) {
                if (c === theNULL) {
                    continue;
                }
                if (c === 0o021) {
                    continue;
                }
                if (c !== Cmd.IAC) {
                    this.buf[this.sb].push(c);
                    continue;
                } else {
                    this.iacSeq.push(c);
                }
            } else if (this.iacSeq.length === 1) {
                if ([Cmd.DO, Cmd.DONT, Cmd.WILL, Cmd.WONT].indexOf(c) !== -1) {
                    this.iacSeq.push(c);
                    continue;
                }

                this.iacSeq = [];
                if (c === Cmd.IAC) {
                    this.buf[this.sb].push(c);
                } else if (c === Cmd.SB) {
                    this.sb = 1;
                    this.buf[1] = [];
                    this.EvtNegotiation.fire({cmd: c, opt: null});
                } else if (c === Cmd.SE) {
                    this.sb = 0;
                    this.EvtNegotiation.fire({cmd: c, opt: null});
                    this.buf[1] = [];
                } else {
                    console.log("IAC " + c + " not recognized");
                }
            } else if (this.iacSeq.length === 2) {
                let cmd = this.iacSeq[1];
                this.iacSeq = [];

                let opt = c;

                if ([Cmd.DO, Cmd.DONT].indexOf(cmd) !== -1) {
                    let handled = this.EvtNegotiation.fire({cmd: cmd, opt: opt});

                    if (!handled) {
                        this.writeArr([Cmd.IAC, Cmd.WONT, opt]);
                    }
                } else if ([Cmd.WILL, Cmd.WONT].indexOf(cmd) !== -1) {
                    let abc = <any>this.EvtNegotiation;

                    let handled = this.EvtNegotiation.fire({cmd: cmd, opt: opt});

                    if (!handled) {
                        this.writeArr([Cmd.IAC, Cmd.DONT, opt]);
                    }
                }
            }
        }

        if (this.buf[0].length > 0) {
            let arr = new Uint8Array(this.buf[0]);
            this.EvtData.fire(arr.buffer);
            this.buf[0] = [];
        }
    }
}

// Telnet protocol characters (don't change)
export namespace Cmd {
    export const IAC  = 255;  // "Interpret As Command"
    export const DONT = 254;
    export const DO   = 253;
    export const WONT = 252;
    export const WILL = 251;

    export const SE  = 240;  // Subnegotiation End
    export const NOP = 241;  // No Operation
    export const DM  = 242;  // Data Mark
    export const BRK = 243;  // Break
    export const IP  = 244;  // Interrupt process
    export const AO  = 245;  // Abort output
    export const AYT = 246;  // Are You There
    export const EC  = 247;  // Erase Character
    export const EL  = 248;  // Erase Line
    export const GA  = 249;  // Go Ahead
    export const SB =  250;  // Subnegotiation Begin
}
export let CmdName = (() => {
    let dict: {[k: number]: string} = {};
    for (let k in Cmd) {
        dict[(<any>Cmd)[k]] = k;
    }

    return (cmd: number): string => {
        return (<any>dict)[cmd];
    };
})();

const theNULL = 0;

// Telnet protocol options code (don't change)
export namespace Opt {
    // These ones all come from arpa/telnet.h
    export const BINARY = 0; // 8-bit data path
    export const ECHO = 1; // echo
    export const RCP = 2; // prepare to reconnect
    export const SGA = 3; // suppress go ahead
    export const NAMS = 4; // approximate message size
    export const STATUS = 5; // give status
    export const TM = 6; // timing mark
    export const RCTE = 7; // remote controlled transmission and echo
    export const NAOL = 8; // negotiate about output line width
    export const NAOP = 9; // negotiate about output page size
    export const NAOCRD = 10; // negotiate about CR disposition
    export const NAOHTS = 11; // negotiate about horizontal tabstops
    export const NAOHTD = 12; // negotiate about horizontal tab disposition
    export const NAOFFD = 13; // negotiate about formfeed disposition
    export const NAOVTS = 14; // negotiate about vertical tab stops
    export const NAOVTD = 15; // negotiate about vertical tab disposition
    export const NAOLFD = 16; // negotiate about output LF disposition
    export const XASCII = 17; // extended ascii character set
    export const LOGOUT = 18; // force logout
    export const BM = 19; // byte macro
    export const DET = 20; // data entry terminal
    export const SUPDUP = 21; // supdup protocol
    export const SUPDUPOUTPUT = 22; // supdup output
    export const SNDLOC = 23; // send location
    export const TTYPE = 24; // terminal type
    export const EOR = 25; // end or record
    export const TUID = 26; // TACACS user identification
    export const OUTMRK = 27; // output marking
    export const TTYLOC = 28; // terminal location number
    export const VT3270REGIME = 29; // 3270 regime
    export const X3PAD = 30; // X.3 PAD
    export const NAWS = 31; // window size
    export const TSPEED = 32; // terminal speed
    export const LFLOW = 33; // remote flow control
    export const LINEMODE = 34; // Linemode option
    export const XDISPLOC = 35; // X Display Location
    export const OLD_ENVIRON = 36; // Old - Environment variables
    export const AUTHENTICATION = 37; // Authenticate
    export const ENCRYPT = 38; // Encryption option
    export const NEW_ENVIRON = 39; // New - Environment variables
    // the following ones come from
    // http://www.iana.org/assignments/telnet-options
    // Unfortunately, that document does not assign identifiers
    // to all of them, so we are making them up
    export const TN3270E = 40; // TN3270E
    export const XAUTH = 41; // XAUTH
    export const CHARSET = 42; // CHARSET
    export const RSP = 43; // Telnet Remote Serial Port
    export const COM_PORT_OPTION = 44; // Com Port Control Option
    export const SUPPRESS_LOCAL_ECHO = 45; // Telnet Suppress Local Echo
    export const TLS = 46; // Telnet Start TLS
    export const KERMIT = 47; // KERMIT
    export const SEND_URL = 48; // SEND-URL
    export const FORWARD_X = 49; // FORWARD_X
    export const PRAGMA_LOGON = 138; // TELOPT PRAGMA LOGON
    export const SSPI_LOGON = 139; // TELOPT SSPI LOGON
    export const PRAGMA_HEARTBEAT = 140; // TELOPT PRAGMA HEARTBEAT
    export const EXOPL = 255; // Extended-Options-List
    export const NOOPT = 0;
}
export let OptName = (() => {
    let dict: {[k: number]: string} = {};
    for (let k in Opt) {
        dict[(<any>Opt)[k]] = k;
    }

    return (opt: number): string => {
        return (<any>dict)[opt];
    };
})();