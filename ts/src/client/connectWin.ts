import { Socket } from "./socket";

export class ConnectWin {
    private socket: Socket;

    private $win: JQuery;
    private $connectButton: JQuery;
    private $hostInput: JQuery;
    private $portInput: JQuery;

    constructor(socket: Socket) {
        this.socket = socket;

        let win = document.createElement("div");
        win.style.display = "none";
        win.className = "winConnect";
        document.body.appendChild(win);

        win.innerHTML = `
        <!--header-->
        <div>CONNECTION</div>
        <!--content-->
        <div>
            Host: 
            <input class="winConnect-inputHost">
            <br>
            Port:
            <input class="winConnect-inputPort">
            <br>
            <button class="winConnect-btnConnect" style="height:10%">CONNECT</button>
        </div>
        `;

        this.$win = $(win);
        this.$connectButton = $(win.getElementsByClassName("winConnect-btnConnect")[0]);
        this.$hostInput = $(win.getElementsByClassName("winConnect-inputHost")[0]);
        this.$portInput = $(win.getElementsByClassName("winConnect-inputPort")[0]);

        (<any>this.$win).jqxWindow({width: 600, height: 400});

        this.$connectButton.click(this.handleConnectButtonClick.bind(this));
    }

    private handleConnectButtonClick() {
        let host: string = this.$hostInput.val().trim();
        let port: number = this.$portInput.val().trim();

        this.socket.openTelnet(host, port);

        this.hide();
    }

    public show() {
        (<any>this.$win).jqxWindow("open");
    }

    private hide() {
        (<any>this.$win).jqxWindow("close");
    }
}
