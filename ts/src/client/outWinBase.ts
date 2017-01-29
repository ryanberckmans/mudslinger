import * as Util from "./util";

export class OutWinBase {
    private lineCount: number = 0;
    private maxLines: number = 5000;
    public setMaxLines(count: number) {
        this.maxLines = count;
    }

    private fgColor: any = null;
    private bgColor: any = null;

    public setFgColor(color: any) {
        this.fgColor = color;
    }

    public setBgColor(color: any) {
        this.bgColor = color;
    };

    // handling nested elements, always output to last one
    private targetElems: any[] = null;
    protected target: any = null;
    private rootElem: any = null;

    private scrollLock = false; // true when we should not scroll to bottom
    private handleScroll(e: any) {
        let scrollHeight = this.rootElem.prop("scrollHeight");
        let scrollTop = this.rootElem.scrollTop();
        let outerHeight = this.rootElem.outerHeight();
        let is_at_bottom = outerHeight + scrollTop >= scrollHeight;

        this.scrollLock = !is_at_bottom;
    }

    // must set root elem before actually using it
    protected setRootElem(elem: any) {
        // this may be called upon layout reload
        this.rootElem = elem;
        this.targetElems = [elem];
        this.target =  elem;

        // direct children of the root will be line containers, let"s push the first one.
        this.pushElem($("<span>").appendTo(elem));

        this.rootElem.bind("scroll", (e: any) => { this.handleScroll(e); });
    };

    // elem is the actual jquery element
    public pushElem(elem: any) {
//        console.log(o);
//        console.log("elem pushed");
//        console.log(elem);
        this.writeBuffer();

        this.target.append(elem);
        this.targetElems.push(elem);
        this.target = elem;
    }

    public popElem() {
        this.writeBuffer();

        let popped = this.targetElems.pop();
//        console.log(o);
//        console.log("elem popped");
//        console.log(popped);
        this.target = this.targetElems[this.targetElems.length - 1];
        return popped;
    }

    protected handleLine(line: string) {
        // default to nothing, main output window will send it to trigger manager
    }

    private appendBuffer = "";
    private lineText = ""; // track full text of the line with no escape sequences or tags
    public addText(txt: string) {
        this.lineText += txt;
        let html = Util.rawToHtml(txt);
//        let span = $(document.createElement("span"));
        let span_text = "<span";
        let style = "";
        if (this.fgColor || this.bgColor) {
            style = " style=\"";
            if (this.fgColor) {
                style += "color:" + this.fgColor + ";";
            }
            if (this.bgColor) {
                style += "background-color:" + this.bgColor + ";";
            }
            style += "\"";
        }
        span_text += style + ">";
        span_text += html;
        span_text += "</span>";
        this.appendBuffer += span_text;

        if (txt.endsWith("\n")) {
            this.target.append(this.appendBuffer);
            this.appendBuffer = "";
            this.newLine();
        }
    };

    private newLine() {
        this.popElem(); // pop the old line
        this.pushElem($("<span>").appendTo(this.target));

        this.handleLine(this.lineText);
        this.lineText = "";

        this.lineCount += 1;
        if (this.lineCount > this.maxLines) {
            this.rootElem.children(":lt(" +
                (this.maxLines / 2) +
                ")"
            ).remove();
            this.lineCount = (this.maxLines / 2);
        }
    }

    private writeBuffer() {
        this.target.append(this.appendBuffer);
        this.appendBuffer = "";
    };

    public outputDone() {
        this.writeBuffer();
        this.scrollBottom();
    };

    private scrollRequested = false;
    private privScrolBottom() {
        console.time("_scroll_bottom");
        let elem = this.rootElem;
        elem.scrollTop(elem.prop("scrollHeight"));
        this.scrollLock = false;
        this.scrollRequested = false;
        console.timeEnd("_scroll_bottom");
    };

    protected scrollBottom(force: boolean = false) {
        if (this.scrollLock && force !== true) {
            return;
        }
        if (this.scrollRequested) {
            return;
        }

        requestAnimationFrame(() => this.privScrolBottom());
        this.scrollRequested = true;
    }
}
