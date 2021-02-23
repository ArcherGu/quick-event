import { CallbackList } from "./callback_list";
import { CallbackNode } from "./callback_node";
import { SimplePropertyRetriever } from "./helper/object";
import { MixinFilter } from "./mixins/mixin_filter";
import { ArgumentPassingMode, Callback, QuickEventParams } from "./types";

function _extend(destination: EventDispatcher, source: MixinFilter) {
    const allSourceProperty = SimplePropertyRetriever.getOwnAndPrototypeEnumerablesAndNonenumerables(source);
    const allObjectProperty = SimplePropertyRetriever.getOwnAndPrototypeEnumerablesAndNonenumerables(new Object());
    const customSourceProperty = allSourceProperty.filter((val) => allObjectProperty.indexOf(val) === -1);

    for (const k of customSourceProperty) {
        destination[k] = source[k];
    }

    return destination;
}

/**
 * EventDispatcher is something like a map between the `EventType` and `CallbackList`.
 *
 * EventDispatcher holds a map of `<EventType, CallbackList>` pairs. On dispatching, EventDispatcher finds the CallbackList of the event type, then invoke the callback list. The invocation is always synchronous. The listeners are triggered when [EventDispatcher.dispatch](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html#dispatch) is called.
 *
 * ## Nested listener safety
 * 1. If a listener adds another listener of the same event to the dispatcher during a dispatching, the new listener is guaranteed not to be triggered within the same dispatching. This is guaranteed by an unsigned 64 bits integer counter. This rule will be broken is the counter is overflowed to zero in a dispatching, but this rule will continue working on the subsequence dispatching.<br/>
 * 2. Any listeners that are removed during a dispatching are guaranteed not triggered.
 * @export
 * @class EventDispatcher
 */
export class EventDispatcher {
    /**
     * ArgumentPassingMode: IncludeEvent
     * @static
     * @readonly
     * @memberof EventDispatcher
     */
    static readonly argumentPassingIncludeEvent: ArgumentPassingMode = ArgumentPassingMode.IncludeEvent;

    /**
     * ArgumentPassingMode: ExcludeEvent
     * @static
     * @readonly
     * @memberof EventDispatcher
     */
    static readonly argumentPassingExcludeEvent: ArgumentPassingMode = ArgumentPassingMode.ExcludeEvent;

    /**
     * ArgumentPassingMode: ExcludeEvent
     * @static
     * @readonly
     * @memberof EventDispatcher
     */
    static readonly defaultArgumentPassingMode: ArgumentPassingMode = ArgumentPassingMode.ExcludeEvent;

    protected argumentsAsArray: boolean;
    private _eventCallbackListMap: { [key: string]: CallbackList;[key: number]: CallbackList; } = {};
    private _params: QuickEventParams;
    private _getEvent: ((...args: any[]) => any) | null;
    private _argumentPassingMode: ArgumentPassingMode;
    private _mixins: MixinFilter[];

    constructor(params?: QuickEventParams) {
        params = params || {};
        this._params = params;
        this._getEvent = typeof params.getEvent === 'function' ? params.getEvent : null;
        this._argumentPassingMode = params.argumentPassingMode ? params.argumentPassingMode : EventDispatcher.defaultArgumentPassingMode;
        this.argumentsAsArray = params.argumentsAsArray ? !!params.argumentsAsArray : false;

        this._mixins = params.mixins ? params.mixins : [];
        for (const mixin of this._mixins) {
            _extend(this, mixin);
        }
    }

    /**
     * Add the *callback* to the dispatcher to listen to *event*.<br/>
     * The listener is added to the end of the listener list.<br/>
     * Return a handle object which represents the listener. The handle can be used to remove this listener or insert other listener before this listener.<br/>
     * If `appendListener` is called in another listener during a dispatching, the new listener is guaranteed not triggered during the same dispatching.<br/>
     * If the same callback is added twice, it results duplicated listeners.<br/>
     * The time complexity is O(1).
     *
     * @param {(string | number)} event
     * @param {Callback} callback
     * @returns {CallbackNode}
     * @memberof EventDispatcher
     */
    public appendListener(event: string | number, callback: Callback): CallbackNode {
        return this._doGetCallbackList(event, true)!.append(callback);
    }

    /**
     * Add the *callback* to the dispatcher to listen to *event*.<br/>
     * The listener is added to the beginning of the listener list.<br/>
     * Return a handle object which represents the listener. The handle can be used to remove this listener or insert other listener before this listener.<br/>
     * If `prependListener` is called in another listener during a dispatching, the new listener is guaranteed not triggered during the same dispatching.<br/>
     * The time complexity is O(1).
     *
     * @param {(string | number)} event
     * @param {Callback} callback
     * @returns {CallbackNode}
     * @memberof EventDispatcher
     */
    public prependListener(event: string | number, callback: Callback): CallbackNode {
        return this._doGetCallbackList(event, true)!.prepend(callback);
    }

    /**
     * Insert the *callback* to the dispatcher to listen to *event* before the listener handle *before*. If *before* is not found, *callback* is added at the end of the listener list.<br/>
     * *before* can be a callback function, or a handle object.<br/>
     * Return a handle object which represents the listener. The handle can be used to remove this listener or insert other listener before this listener.<br/>
     * If `insertListener` is called in another listener during a dispatching, the new listener is guaranteed not triggered during the same dispatching.<br/>
     * The time complexity is O(1).
     *
     * @param {(string | number)} event
     * @param {Callback} callback
     * @param {(Callback | CallbackNode | null | undefined)} before
     * @returns {CallbackNode}
     * @memberof EventDispatcher
     */
    public insertListener(event: string | number, callback: Callback, before: Callback | CallbackNode | null | undefined): CallbackNode {
        return this._doGetCallbackList(event, true)!.insert(callback, before);
    }

    /**
     * Remove the listener *callback* which listens to *event* from the dispatcher.<br/>
     * *callback* can be a callback function, or a handle object.<br/>
     * Return true if the listener is removed successfully, false if the listener is not found.<br/>
     * The time complexity is O(1).
     *
     * @param {(string | number)} event
     * @param {(Callback | CallbackNode | null | undefined)} handle
     * @returns {boolean}
     * @memberof EventDispatcher
     */
    public removeListener(event: string | number, handle: Callback | CallbackNode | null | undefined): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.remove(handle);
        }

        return false;
    }

    /**
     * Return true if the dispatcher contains *callback*.<br/>
     * *callback* can be a callback function, or a handle object.
     *
     * @param {(string | number)} event
     * @param {(Callback | CallbackNode | null | undefined)} handle
     * @returns {boolean}
     * @memberof EventDispatcher
     */
    public hasListener(event: string | number, handle: Callback | CallbackNode | null | undefined): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.has(handle);
        }

        return false;
    }

    /**
     * Return true if the dispatcher contains any callback.
     *
     * @param {(string | number)} event
     * @returns {boolean}
     * @memberof EventDispatcher
     */
    public hasAnyListener(event: string | number): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.hasAny();
        }

        return false;
    }

    /**
     * Dispatch an event.<br/>
     * The listeners are called with arguments `arg1`, `arg2`, etc.
     *
     * @param {...any[]} args
     * @memberof EventDispatcher
     */
    public dispatch(...args: any[]) {
        this.applyDispatch(args);
    }

    /**
     * Dispatch an event.<br/>
     * The listeners are called with arguments `arg1`, `arg2`, etc.<br/>
     * Note the arguments are passed in an array, similar to Function.prototype.apply.
     *
     * @param {any[]} args
     * @returns
     * @memberof EventDispatcher
     */
    public applyDispatch(args: any[]) {
        for (const mixin of this._mixins) {
            if (mixin.mixinBeforeDispatch && !mixin.mixinBeforeDispatch.call(this, args)) {
                return;
            }
        }

        if (this._getEvent) {
            let event: any;
            if (this.argumentsAsArray) {
                event = this._getEvent.call(this, args);
            }
            else {
                event = this._getEvent.apply(this, args);
            }

            const cbList = this._doGetCallbackList(event, false);
            if (cbList) {
                if (this._argumentPassingMode === EventDispatcher.argumentPassingIncludeEvent) {
                    args = [event, ...args];
                }
                cbList.dispatch.apply(cbList, args);
            }
        }
        else {
            const cbList = this._doGetCallbackList(args[0], false);
            if (cbList) {
                if (this._argumentPassingMode === EventDispatcher.argumentPassingExcludeEvent) {
                    args = Array.prototype.slice.call(args, 1);
                }
                cbList.dispatch.apply(cbList, args);
            }
        }
    }

    /**
     * Apply `func` to all listeners of `event`.<br/>
     * The `func` receives one parameter which is the callback.<br/>
     * **Note**: the `func` can remove any listeners, or add other listeners, safely.
     *
     * @param {(string | number)} event
     * @param {(callback: Callback) => any} func
     * @memberof EventDispatcher
     */
    public forEach(event: string | number, func: (callback: Callback) => any) {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            cbList.forEach(func);
        }
    }

    /**
     * Apply `func` to all listeners of `event`. `func` must return a boolean value, and if the return value is false, forEachIf stops the looping immediately.<br/>
     * Return `true` if all listeners are invoked, or `event` is not found, `false` if `func` returns `false`.
     *
     * @param {(string | number)} event
     * @param {(callback: Callback) => any} func
     * @returns {boolean}
     * @memberof EventDispatcher
     */
    public forEachIf(event: string | number, func: (callback: Callback) => any): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.forEachIf(func);
        }

        return true;
    }

    private _doGetCallbackList(event: string | number, createOnNotFound: boolean) {
        if (this._eventCallbackListMap.hasOwnProperty(event)) {
            return this._eventCallbackListMap[event];
        }

        if (createOnNotFound) {
            const cbList = new CallbackList(this._params);
            this._eventCallbackListMap[event] = cbList;
            return cbList;
        }

        return null;
    }
}