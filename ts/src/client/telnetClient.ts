import { Telnet, NegotiationData, Cmd, Opt } from "./telnetlib";

export interface TelnetClient {
    on(event: "serverEcho", listener: (data: boolean) => void): this;
    emit(event: "serverEcho", data: boolean): boolean;
    
    on(event: string, listener: (data: any) => void): this;
    emit(event: string, data: any): boolean;
}

export interface Telnet {
    on(event: "echo", listener: (data: boolean) => void): this;
}

export class TelnetClient extends Telnet {
    constructor(writeFunc: (data: ArrayBuffer) => void) {
        super(writeFunc);

        this.on("negotiation", (data) => { return this.onNegotiation(data); });
    }

    private onNegotiation (data: NegotiationData) {
        let {cmd, opt} = data;

        if (cmd === Cmd.WILL) {
            if (opt === Opt.ECHO) {
                this.emit("serverEcho", true);
            } else if (opt === ExtOpt.MSDP) {
                this.writeArr([Cmd.IAC, Cmd.DO, ExtOpt.MSDP]);
            }
        } else if (cmd === Cmd.WONT) {
            if (opt === Opt.ECHO) {
                this.emit("serverEcho", false);
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
