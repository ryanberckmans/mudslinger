import {Message} from "./message";
import {OutWinBase} from "./outWinBase";

export class ChatWin extends OutWinBase {
    private html: string;

    constructor(private message: Message) {
        super();

        this.message.prepareReloadLayout.subscribe(this.prepareReloadLayout, this);
        this.message.loadLayout.subscribe(this.loadLayout, this);
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

