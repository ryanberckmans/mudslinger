import { GlEvent, GlDef } from "./event";
import * as Util from "./util";

const exits: {[k: string]: string} = {
    northwest: "<line x1=\"0\" y1=\"0\" x2=\"25\" y2=\"25\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    north: "<line x1=\"50\" y1=\"0\" x2=\"50\" y2=\"25\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    northeast: "<line x1=\"100\" y1=\"0\" x2=\"75\" y2=\"25\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    east: "<line x1=\"75\" y1=\"50\" x2=\"100\" y2=\"50\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    southeast: "<line x1=\"100\" y1=\"100\" x2=\"75\" y2=\"75\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    south: "<line x1=\"50\" y1=\"100\" x2=\"50\" y2=\"75\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    southwest: "<line x1=\"0\" y1=\"100\" x2=\"25\" y2=\"75\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    west: "<line x1=\"0\" y1=\"50\" x2=\"25\" y2=\"50\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />",
    up: "<line x1=\"112\" y1=\"45\" x2=\"112\" y2=\"20\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />"
        + "<polyline points=\"104,28 112,20 120,28\" style=\"fill:none;stroke:rgb(255,0,0);stroke-width:4\"></polyline>",
    down: "<line x1=\"112\" y1=\"55\" x2=\"112\" y2=\"80\" style=\"stroke:rgb(255,0,0);stroke-width:4\" />"
        + "<polyline points=\"104,72, 112,80 120,72\" style=\"fill:none;stroke:rgb(255,0,0);stroke-width:4\"></polyline>"
};

const doors: {[k: string]: string} = {
    northwest: "<line x1=\"8\" y1=\"17\" x2=\"17\" y2=\"8\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    north: "<line x1=\"43\" y1=\"12\" x2=\"57\" y2=\"12\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    northeast: "<line x1=\"92\" y1=\"17\" x2=\"83\" y2=\"8\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    east: "<line x1=\"88\" y1=\"43\" x2=\"88\" y2=\"57\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    southeast: "<line x1=\"92\" y1=\"83\" x2=\"83\" y2=\"92\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    south: "<line x1=\"43\" y1=\"88\" x2=\"57\" y2=\"88\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    southwest: "<line x1=\"8\" y1=\"83\" x2=\"17\" y2=\"92\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    west: "<line x1=\"12\" y1=\"43\" x2=\"12\" y2=\"57\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    up: "<line x1=\"105\" y1=\"35\" x2=\"119\" y2=\"35\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />",
    down: "<line x1=\"105\" y1=\"65\" x2=\"119\" y2=\"65\" style=\"stroke:rgb(0,0,0);stroke-width:3\" />"
};

export class MapWin {
    constructor() {
        GlEvent.msdpVar.handle(this.handleMsdpVar, this);
        GlEvent.prepareReloadLayout.handle(this.prepareReloadLayout, this);
        GlEvent.loadLayout.handle(this.loadLayout, this);
    }

    private prepareReloadLayout() {
        // nada
    };

    private loadLayout() {
        this.updateGrid();
        this.updateRoomName();
    };


    private dirs: {[k: string]: string} = {};
    private roomName = "";
    private roomVnum: string = null;
    private roomSector: string = null;

    private editMode: string = null;
    private editVnum: string = null;

    private updateGrid() {
        let output = "";

        let room_ex = this.dirs;

        for (let key in room_ex) {

//            for (var i=0; i < key.length; i++) {
//                console.log(key.charCodeAt(i));
//            }
            output += exits[key];

            if (room_ex[key] === "C") {
                output += doors[key];
            }
        }
        output += "<rect x=\"25\" y=\"25\" width=\"50\" height=\"50\" style=\"fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)\">";

//        console.log(output);
        $("#svg_cont").html("<center><svg height=\"100%\" width=\"100%\">" + output + "<</svg></center>");
    };

    private updateRoomName() {
        let room_name = Util.stripColorTags(this.roomName);
        if (this.roomVnum && this.roomSector) {
            room_name += " [Room " + this.roomVnum + " " + this.roomSector + "]";
        }
        $("#room_name").html(room_name);
    };

    private updateOlcStatus() {
        if (!this.editMode || !this.editVnum) {
            return;
        }
        $("#olc_status").html(this.editMode + " " + this.editVnum);
    };

    private handleMsdpVar(data: GlDef.MsdpVarData) {
        switch (data.varName) {
            case "EDIT_MODE":
                this.editMode = data.value;
                this.updateOlcStatus();
                break;
            case "EDIT_VNUM":
                this.editVnum = data.value;
                this.updateOlcStatus();
                break;
            case "ROOM_NAME":
                this.roomName = data.value;
                this.updateRoomName();
                break;
            case "ROOM_VNUM":
                this.roomVnum = data.value;
                this.updateRoomName();
                break;
            case "ROOM_SECTOR":
                this.roomSector = data.value;
                this.updateRoomName();
                break;
            case "ROOM_EXITS":
                let val;
                if (data.value === "") {
                    val = {};
                } else {
                    val = data.value;
                }
                this.dirs = $.extend({}, val);
                this.updateGrid();
                break;
            default:
                return;
        }

    };
}
