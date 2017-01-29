import {ChatWin} from "./chatWin";
import {Message, MsgDef} from "./message";
import {OutputManager} from "./outputManager";

export class Mxp {
    private openTags: Array<string> = [];
    private tagHandlers: Array<(tag: string) => void> = [];

    constructor(private message: Message, private outputManager: OutputManager, private chatWin: ChatWin) {
        this.makeTagHandlers();

        this.message.mxpTag.subscribe(this.handleMxpTag, this);
    }

    private makeTagHandlers() {
        this.tagHandlers.push((tag) => {
            let re = /^<version>$/i;
            let match = re.exec(tag);
            if (match) {
                this.message.sendCommand.publish({
                    value: "\x1b[1z<VERSION CLIENT=ArcWeb MXP=0.01>", // using closing line tag makes it print twice...
                    noPrint: true});
                return true;
            }
            return false;
        });

        this.tagHandlers.push((tag) => {
            /* hande image tags */
            let re = /^<image\s*(\S+)\s*url="(.*)">$/i;
            let match = re.exec(tag);
            if (match) {
                /* push and pop is dirty way to do this, clean it up later */
                let elem = $("<img src=\"" + match[2] + match[1] + "\">");
                this.outputManager.pushMxpElem(elem);
                this.outputManager.popMxpElem();
                return true;
            }

            return false;
        });

        this.tagHandlers.push((tag) => {
            /* handle dest tags */
            let re = /^<dest comm>$/i;
            let match = re.exec(tag);
            if (match) {
                this.openTags.push("dest");
                this.outputManager.pushTarget(this.chatWin);
                return true;
            }

            re = /^<\/dest>$/i;
            match = re.exec(tag);
            if (match) {
                if (this.openTags[this.openTags.length - 1] !== "dest") {
                    /* We actually expect this to happen because the mud sends newlines inside DEST tags right now... */
                    // console.log("Got closing dest tag with no opening tag.");
                } else {
                    this.openTags.pop();
                    this.outputManager.popTarget();
                }
                return true;
            }

            return false;
        });
        this.tagHandlers.push((tag) => {
            let re = /^<a /i;
            let match = re.exec(tag);
            if (match) {
                this.openTags.push("a");
                let elem = $(tag);
                elem.attr("target", "_blank");
                let color = this.outputManager.getFgColor();
                elem.css("border-bottom", "1px solid " + color);
                this.outputManager.pushMxpElem(elem);
                return true;
            }

            re = /^<\/a>/i;
            match = re.exec(tag);
            if (match) {
                if (this.openTags[this.openTags.length - 1] !== "a") {
                    /* We actually expect this to happen because the mud sends newlines inside DEST tags right now... */
                    console.log("Got closing a tag with no opening tag.");
                } else {
                    this.openTags.pop();
                    this.outputManager.popMxpElem();
                }
                return true;
            }

            return false;
        });
        this.tagHandlers.push((tag) => {
            let re = /^<([bius])>/i;
            let match = re.exec(tag);
            if (match) {
                this.openTags.push(match[1]);
                let elem = $(tag);
                this.outputManager.pushMxpElem(elem);
                return true;
            }

            re = /^<\/([bius])>/i;
            match = re.exec(tag);
            if (match) {
                if (this.openTags[this.openTags.length - 1] !== match[1]) {
                    console.log("Got closing " + match[1] + " tag with no opening tag.");
                } else {
                    this.openTags.pop();
                    this.outputManager.popMxpElem();
                }
                return true;
            }

            return false;
        });
        this.tagHandlers.push((tag) => {
            let re = /^<send/i;
            let match = re.exec(tag);
            if (match) {
                /* match with explicit href */
                let tag_re = /^<send (?:href=)?[""](.*)[""]>$/i;
                let tag_m = tag_re.exec(tag);
                if (tag_m) {
                    let cmd = tag_m[1];
                    let html_tag = "<a href=\"#\" title=\"" + cmd + "\">";
                    let elem = $(html_tag);
                    let color = this.outputManager.getFgColor() || elem.css("color");
                    elem.css("border-bottom", "1px solid " + color);
                    elem.click(() => {
                        this.message.sendCommand.publish({value: tag_m[1]});
                    });
                    this.openTags.push("send");
                    this.outputManager.pushMxpElem(elem);
                    return true;
                }

                /* just the tag */
                tag_re = /^<send>$/i;
                tag_m = tag_re.exec(tag);
                if (tag_m) {
                    this.openTags.push("send");
                    let html_tag = "<a href=\"#\">";
                    let elem = $(html_tag);
                    let color = this.outputManager.getFgColor() || elem.css("color");
                    elem.css("border-bottom", "1px solid " + color);
                    this.outputManager.pushMxpElem(elem);
                    return true;
                }
            }

            re = /^<\/send>/i;
            match = re.exec(tag);
            if (match) {
                if (this.openTags[this.openTags.length - 1] !== "send") {
                    console.log("Got closing send tag with no opening tag.");
                } else {
                    this.openTags.pop();
                    let elem = this.outputManager.popMxpElem();
                    if (!elem[0].hasAttribute("title")) {
                        /* didn"t have explicit href so we need to do it here */
                        let txt = elem.text();
                        elem[0].setAttribute("title", txt);
                        elem.click(() => {
                            this.message.sendCommand.publish({value: txt});
                        });
                    }
                }
                return true;
            }

            return false;
        });
    }

    private handleMxpTag(data: MsgDef.MxpTagMsg) {
        let handled = false;
        for (let i = 0; i < this.tagHandlers.length; i++) {
            /* tag handlers will return true if it"s a match */
            if (this.tagHandlers[i](data.value)) {
                handled = true;
                break;
            }
        }

        if (!handled) {
            console.log("Unsupported MXP tag: " + data.value);
        }
    };

    // Need to close any remaining open tags whe we get newlines
    public handleNewline() {
        if (this.openTags.length < 1) {
            return;
        }

        for (let i = this.openTags.length - 1; i >= 0; i--) {
            if (this.openTags[i] === "dest") {
                this.outputManager.popTarget();
            } else {
                this.outputManager.popMxpElem();
            }
        }
        this.openTags = [];
    };
}
