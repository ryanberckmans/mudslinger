export function replaceLtGt(text: string): string {
    return text.replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
}

export function replaceAmp(text: string): string {
    return text.replace(/&/g, "&amp;");
}

export function replaceLf(text: string): string {
    // We are presumably already stripping out CRs before this
    return text.replace(/\n/g, "<br>");
}

export function rawToHtml(text: string): string {
    return replaceLf(
            replaceLtGt(
            replaceAmp(text)));
}

export function stripColorTags(text: string): string {
    let rtn = "";
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "{") {
            if (i === text.length - 1) {
                break;
            }
            else if (text[i + 1] === "{") {
                rtn += "{";
                i++;
            }
            else {
                i++;
            }
        }
        else {
            rtn += text[i];
        }
    }

    return rtn;
}
