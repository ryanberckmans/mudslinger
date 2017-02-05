import { expect, assert } from 'chai';
import { MsdpDef, ParseMsdp } from '../../src/client/telnetClient';

let chr = String.fromCharCode;
let VAR = chr(MsdpDef.VAR);
let VAL = chr(MsdpDef.VAL);
let ARRAY_OPEN = chr(MsdpDef.ARRAY_OPEN);
let ARRAY_CLOSE = chr(MsdpDef.ARRAY_CLOSE);
let TABLE_OPEN = chr(MsdpDef.TABLE_OPEN);
let TABLE_CLOSE = chr(MsdpDef.TABLE_CLOSE);


function ToBytes(data: string) {
    let rtn: Array<number> = [];
    for (let i = 0; i < data.length; i++) {
        rtn.push(data.charCodeAt(i));
    }

    return rtn;
}


describe("ParseMsdp", () => {
    it("SERVER_ID", () => {
        let data = `${VAR}SERVER_ID${VAL}Aarchon MUD`;
        let bytes = ToBytes(data);
        let exp = ["SERVER_ID", "Aarchon MUD"];
        let result = ParseMsdp(bytes);
        expect(result).to.deep.equal(exp);
    });

    it("OPPONENT_NAME", () => {
        let data = `${VAR}OPPONENT_NAME${VAL}`;
        let bytes = ToBytes(data);
        let exp = ["OPPONENT_NAME", ""];
        let result = ParseMsdp(bytes);
        expect(result).to.deep.equal(exp);
    });

    it("AFFECTS", () => {
        let data = `${VAR}AFFECTS${VAL}${TABLE_OPEN}${VAR}fade${VAL}13${VAR}sanctuary${VAL}13${VAR}shield${VAL}29${TABLE_CLOSE}${VAR}MANA${VAL}14144`;
        let bytes = ToBytes(data);
        let exp = ["AFFECTS", {
            fade: "13",
            sanctuary: "13",
            shield: "29"
        }];
        let result = ParseMsdp(bytes);
        expect(result).to.deep.equal(exp);
    });

    it("ROOM_EXITS", () => {
        let data = `${VAR}ROOM_EXITS${VAL}${TABLE_OPEN}${VAR}north${VAL}O${VAR}down${VAL}O${TABLE_CLOSE}`;
        let bytes = ToBytes(data);
        let exp = ["ROOM_EXITS", {
            north: "O",
            down: "O"
        }];
        let result = ParseMsdp(bytes);
        expect(result).to.deep.equal(exp);
    });

    it("GROUP_INFO", () => {
        let data = `${VAR}GROUP_INFO${VAL}${TABLE_OPEN}${VAR}leader${VAL}Vodur${VAR}members${VAL}` +
                   `${ARRAY_OPEN}${VAL}${TABLE_OPEN}${VAR}name${VAL}Vodur` +
                   `${TABLE_CLOSE}${ARRAY_CLOSE}${TABLE_CLOSE}`;
        let bytes = ToBytes(data);
        let exp = ["GROUP_INFO", {
            leader: "Vodur",
            members: [
                {
                    name: "Vodur"
                }
            ]
        }];
        let result = ParseMsdp(bytes);
        expect(result).to.deep.equal(exp);
    });
});