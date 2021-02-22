import { EventDispatcher } from "./eventdispatcher";
import { QuickEventParams } from "./types";

export class EventQueue extends EventDispatcher {
    private _queueList: any[];
    constructor(params?: QuickEventParams) {
        super(params);
        this._queueList = [];
    }

    public enqueue(...args: any[]) {
        this._queueList.push(args);
    }

    public process() {
        const list = this._queueList;
        this._queueList = [];

        for (const item of list) {
            this.applyDispatch(item);
        }
    }

    public processOne() {
        if (this._queueList.length > 0) {
            this.applyDispatch(this._queueList.shift());
        }
    }

    public processIf(func: (...args: any[]) => boolean) {
        const list = this._queueList;
        this._queueList = [];

        const unprocessedList: any[] = [];

        for (const item of list) {
            let ok: boolean = false;
            if (this._argumentsAsArray) {
                ok = func.call(this, item);
            }
            else {
                ok = func.apply(this, item);
            }

            if (ok) {
                this.applyDispatch(item);
            }
            else {
                unprocessedList.push(item);
            }
        }

        if (unprocessedList.length > 0) {
            this._queueList = this._queueList.concat(unprocessedList);
        }
    }

    public empty() {
        return this._queueList.length === 0;
    }

    public clearEvents() {
        this._queueList.length = 0;
    }

    public peekEvent() {
        return this._queueList[0];
    }

    public takeEvent() {
        if (this._queueList.length > 0) {
            return this._queueList.shift();
        }

        return null;
    }
}