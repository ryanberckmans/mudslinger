class IoEventHook<TData> {
    constructor(private ioObj: any, private evtName: string) {

    }
    
    public handle(callback: (data: TData) => void) {
        return this.ioObj.on(this.evtName, callback);
    }

    public fire(data: TData): boolean {
        return this.ioObj.emit(this.evtName, data);
    }
}

export class IoEvent {
    constructor(private ioOobj: any) {
    }

    public SrvTelnetData = new IoEventHook<ArrayBuffer>(this.ioOobj, "SrvTelnetData");
    public SrvTelnetClosed = new IoEventHook<boolean>(this.ioOobj, "SrvTelnetClosed");
    public SrvTelnetOpened = new IoEventHook<void>(this.ioOobj, "SrvTelnetOpened");
    public SrvTelnetError = new IoEventHook<string>(this.ioOobj, "SrvTelnetError");

    public ClReqTelnetOpen = new IoEventHook<void>(this.ioOobj, "ClReqTelnetOpen");
    public ClReqTelnetClose = new IoEventHook<void>(this.ioOobj, "ClReqTelnetClose");
    public ClReqTelnetWrite = new IoEventHook<ArrayBuffer>(this.ioOobj, "ClReqTelnetWrite");
}
