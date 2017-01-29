export class EventEmitter {
    private events: {[k: string]: Array<(data: any) => void>} = {};

    on(event: string, listener: (data: any) => void): this {
        if (this.events[event] === undefined) {
            this.events[event] = [];
        }
        this.events[event].push(listener);

        return this;
    }

    emit(event: string, data: any): boolean {
        let fired = false;

        if (this.events[event] === undefined) {
            return false;
        }

        for (let listener of this.events[event]) {
            listener.call(this, data);
            
            fired = true;
        }

        return fired;
    }
}