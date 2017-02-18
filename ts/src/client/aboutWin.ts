import { AppInfo } from "./appInfo";

export class AboutWin {
    private $win: JQuery;

    constructor() {
        let win = document.createElement("div");
        win.style.display = "none";
        win.className = "winAbout";
        document.body.appendChild(win);

        win.innerHTML = `
        <!--header-->
        <div>ABOUT</div>
        <!--content-->
        <div>
            <h1>${AppInfo.AppTitle}</h1>
            <br>
            Version: ${AppInfo.Version.Major}.${AppInfo.Version.Minor}.${AppInfo.Version.Revision}
        </div>
        `;

        this.$win = $(win);

        (<any>this.$win).jqxWindow({width: 600, height: 400});
    }

    public show() {
        (<any>this.$win).jqxWindow("open");
    }
}
