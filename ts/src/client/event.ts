export class EventHook<TData> {
    private handlers: Array<(data: TData) => void> = [];
    
    public handle(callback: (data: TData) => void) {
        this.handlers.push(callback);
    }

    public fire(data: TData): boolean {
        if (this.handlers.length < 1) {
            return false;
        }

        for (let cb of this.handlers) {
            cb(data);
        }

        return true;
    }
}