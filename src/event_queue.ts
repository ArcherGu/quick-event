import { EventDispatcher } from "./event_dispatcher";
import { QuickEventParams } from "./types";

/**
 * EventQueue includes all features of [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html) and adds event queue features.<br/>
 * EventQueue is asynchronous. Events are cached in the queue when [EventQueue.enqueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html#enqueue) is called, and dispatched later when [EventQueue.process](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html#process) is called.<br/>
 * EventQueue is equivalent to the event system (QEvent) in Qt, or the message processing in Windows API.
 * @export
 * @class EventQueue
 * @extends {EventDispatcher}
 */
export class EventQueue extends EventDispatcher {
    private _queueList: any[];
    constructor(params?: QuickEventParams) {
        super(params);
        this._queueList = [];
    }

    /**
     * Put an event into the event queue.<br/>
     * All arguments are copied to internal data structure.<br/>
     * The time complexity is O(1).
     *
     * @param {...any[]} args
     * @memberof EventQueue
     */
    public enqueue(...args: any[]) {
        this._queueList.push(args);
    }

    /**
     * Process the event queue. All events in the event queue are dispatched once and then removed from the queue.<br/>
     * The function returns true if any events were processed, false if no event was processed.<br/>
     * Any new events added to the queue during `process()` are not dispatched during current `process()`.
     *
     * @memberof EventQueue
     */
    public process() {
        const list = this._queueList;
        this._queueList = [];

        for (const item of list) {
            this.applyDispatch(item);
        }
    }

    /**
     * Process one event in the event queue. The first event in the event queue is dispatched once and then removed from the queue.<br/>
     * The function returns true if one event was processed, false if no event was processed.<br/>
     * Any new events added to the queue during `processOne()` are not dispatched during current `processOne()`.
     *
     * @memberof EventQueue
     */
    public processOne() {
        if (this._queueList.length > 0) {
            this.applyDispatch(this._queueList.shift());
        }
    }

    /**
     * Process the event queue. Before processing an event, the event is passed to `func` and the event will be processed only if `func` returns true.<br/>
     * `func` takes exactly the same arguments as `EventQueue.enqueue`, and returns a boolean value.<br/>
     * `processIf` returns true if any event was dispatched, false if no event was dispatched.<br/>
     * `processIf` has some good use scenarios:<br/>
     * 1. Process certain events. For example, in a GUI application, the UI related events may be only desired to processed by one module.<br/>
     * 2. Process the events until certain time. For example, in a game engine, the event process may be limited to only several milliseconds, the remaining events will be process in next game loop.
     *
     * @param {(...args: any[]) => boolean} func
     * @memberof EventQueue
     */
    public processIf(func: (...args: any[]) => boolean) {
        const list = this._queueList;
        this._queueList = [];

        const unprocessedList: any[] = [];

        for (const item of list) {
            let ok: boolean = false;
            if (this.argumentsAsArray) {
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

    /**
     * Return true if there is no any event in the event queue, false if there are any events in the event queue.
     *
     * @returns
     * @memberof EventQueue
     */
    public empty() {
        return this._queueList.length === 0;
    }

    /**
     * Clear all queued events without dispatching them.
     *
     * @memberof EventQueue
     */
    public clearEvents() {
        this._queueList.length = 0;
    }

    /**
     * Return a queued event from the queue.<br/>
     * A queued event is an array with all arguments passed to [EventQueue.enqueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html#enqueue).<br/>
     * If the queue is empty, the function returns null.<br/>
     * After the function returns, the original even is still in the queue.
     * @returns
     * @memberof EventQueue
     */
    public peekEvent() {
        return this._queueList[0];
    }

    /**
     * Return an event from the queue and remove the original event from the queue.<br/>
     * If the queue is empty, the function returns null.<br/>
     * After the function returns, the original even is removed from the queue.
     *
     * @returns
     * @memberof EventQueue
     */
    public takeEvent() {
        if (this._queueList.length > 0) {
            return this._queueList.shift();
        }

        return null;
    }
}