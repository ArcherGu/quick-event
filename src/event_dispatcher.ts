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

export class EventDispatcher {
    /**
     * ArgumentPassingMode: 1
     * @static
     * @readonly
     * @type {ArgumentPassingMode}
     * @memberof EventDispatcher
     */
    static readonly argumentPassingIncludeEvent: ArgumentPassingMode = 1;

    /**
     * ArgumentPassingMode: 2
     * @static
     * @readonly
     * @type {ArgumentPassingMode}
     * @memberof EventDispatcher
     */
    static readonly argumentPassingExcludeEvent: ArgumentPassingMode = 2;

    /**
     * ArgumentPassingMode: 2
     * @static
     * @readonly
     * @type {ArgumentPassingMode}
     * @memberof EventDispatcher
     */
    static readonly defaultArgumentPassingMode: ArgumentPassingMode = 2;

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

    public appendListener(event: string | number, callback: Callback): CallbackNode {
        return this._doGetCallbackList(event, true)!.append(callback);
    }

    public prependListener(event: string | number, callback: Callback): CallbackNode {
        return this._doGetCallbackList(event, true)!.prepend(callback);
    }

    public insertListener(event: string | number, callback: Callback, before: Callback | CallbackNode | null | undefined): CallbackNode {
        return this._doGetCallbackList(event, true)!.insert(callback, before);
    }

    public removeListener(event: string | number, handle: Callback | CallbackNode | null | undefined): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.remove(handle);
        }

        return false;
    }

    public hasListener(event: string | number, handle: Callback | CallbackNode | null | undefined): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.has(handle);
        }

        return false;
    }

    public hasAnyListener(event: string | number): boolean {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            return cbList.hasAny();
        }

        return false;
    }

    public dispatch(...args: any[]) {
        this.applyDispatch(args);
    }

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

    public forEach(event: string | number, func: (callback: Callback) => any) {
        const cbList = this._doGetCallbackList(event, false);
        if (cbList) {
            cbList.forEach(func);
        }
    }

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