import { GlEvent } from "./event";
import { OutWinBase } from "./outWinBase";

export class ChatWin extends OutWinBase {
    private html: string;

    private preMyCont: HTMLPreElement;

    constructor(cont: HTMLPreElement) {
        super();

        this.preMyCont = cont;
        this.setRootElem($(cont));

        cont.style.height = "100%";
        cont.style.flexGrow = "1";

        cont.style.fontSize = "10";
        cont.style.backgroundColor = "black";
        cont.style.fontFamily = "\"Courier\",monospace";
        cont.style.color = "rgb(0,187,0)";
        cont.style.whiteSpace = "pre-wrap";
        cont.style.overflowY = "scroll";
        cont.style.overflowX = "scroll";
        cont.style.width = "100%";
    }
}

