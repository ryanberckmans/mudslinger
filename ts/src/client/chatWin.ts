import { GlEvent } from "./event";
import { OutWinBase } from "./outWinBase";

export class ChatWin extends OutWinBase {
    private html: string;

    constructor() {
        super();

        GlEvent.prepareReloadLayout.handle(this.prepareReloadLayout, this);
        GlEvent.loadLayout.handle(this.loadLayout, this);
    }

    private prepareReloadLayout(): void {
        this.html = $("#win_chat").html();
    }

    private loadLayout(): void {
        this.setRootElem($("#win_chat"));
        if (this.html) {
            $("#win_chat").html(this.html);
            this.html = null;
        }
    }
}

