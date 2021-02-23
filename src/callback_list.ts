import { CallbackNode } from './callback_node';
import { Callback, QuickEventParams, Filter } from './types';

/**
 * CallbackList is the fundamental class in quick-event. The other classes [EventDispatcher](event_dispatcher.eventdispatcher.html) and [EventQueue](event_queue.eventqueue.html) are built on CallbackList.
 *
 * CallbackList holds a list of callbacks. At the time of the call, CallbackList simply invokes each callback one by one. Consider CallbackList as the signal/slot system in Qt, or the callback function pointer in some Windows APIs (such as lpCompletionRoutine in ReadFileEx).
 * The *callback* can be any functions.
 *
 * ## Nested callback safety
 * 1. If a callback adds another callback to the callback list during a invoking, the new callback is guaranteed not to be triggered within the same invoking. This is guaranteed by an integer counter. This rule will be broken is the counter is overflowed to zero in a invoking, but this rule will continue working on the subsequence invoking.<br/>
 * 2. Any callbacks that are removed during a invoking are guaranteed not triggered.<br/>
 * 
 * 
 * @export
 * @class CallbackList
 */
export class CallbackList {
    private _head: CallbackNode | null = null;
    private _tail: CallbackNode | null = null;
    private _currentCounter: number = 0;
    private _canContinueInvoking: ((...args: any[]) => boolean) | null | undefined;
    private _argumentsAsArray: boolean;
    private _dispatch: (...args: any[]) => any;
    private _applyDispatch: (...args: any[]) => any;

    constructor(params?: QuickEventParams) {
        params = params || {};
        this._canContinueInvoking = params.hasOwnProperty('canContinueInvoking') ? params.canContinueInvoking : null;
        this._argumentsAsArray = params.hasOwnProperty('argumentsAsArray') ? !!params.argumentsAsArray : false;
        if (this._argumentsAsArray) {
            this._dispatch = this._dispatchArgumentsAsArray;
            this._applyDispatch = this._applyDispatchArgumentsAsArray;
        } else {
            this._dispatch = this._dispatchNotArgumentsAsArray;
            this._applyDispatch = this._applyDispatchNotArgumentsAsArray;
        }
    }

    /**
     * The first [CallbackNode](callback_node.callbacknode.html)
     *
     * @readonly
     * @memberof CallbackList
     */
    get head() {
        return this._head;
    }

    /**
     * The last [CallbackNode](callback_node.callbacknode.html)
     *
     * @readonly
     * @memberof CallbackList
     */
    get tail() {
        return this._tail;
    }

    /**
     * Add the *callback* to the callback list.<br/>
     * The callback is added to the end of the callback list.<br/>
     * Return a handle object that represents the callback. The handle can be used to remove this callback or to insert additional callbacks before this callback.<br/>
     * If `append` is called in another callback during the invoking of the callback list, the new callback is guaranteed not to be triggered during the same callback list invoking.<br/>
     * The time complexity is O(1).
     *
     * @param {Callback} callback
     * @returns {CallbackNode}
     * @memberof CallbackList
     */
    public append(callback: Callback): CallbackNode {
        const node = new CallbackNode(callback, this._getNextCounter());

        if (this._tail) {
            node.previous = this._tail;
            this._tail.next = node;
            this._tail = node;
        } else {
            this._head = node;
            this._tail = node;
        }

        return node;
    }

    /**
     * Add the *callback* to the callback list.<br/>
     * The callback is added to the beginning of the callback list.<br/>
     * Return a handle object that represents the callback. The handle can be used to remove this callback or to insert additional callbacks before this callback.<br/>
     * If `prepend` is called in another callback during the invoking of the callback list, the new callback is guaranteed not to be triggered during the same callback list invoking.<br/>
     * The time complexity is O(1).
     *
     * @param {Callback} callback
     * @returns {CallbackNode}
     * @memberof CallbackList
     */
    public prepend(callback: Callback): CallbackNode {
        const node = new CallbackNode(callback, this._getNextCounter());

        if (this._head) {
            node.next = this._head;
            this._head.previous = node;
            this._head = node;
        } else {
            this._head = node;
            this._tail = node;
        }

        return node;
    }

    /**
     * Insert the *callback* to the callback list before the callback *before*. If *before* is not found, *callback* is added at the end of the callback list.<br/>
     * *before* can be a callback function, or a handle object.<br/>
     * Return a handle object that represents the callback. The handle can be used to remove this callback or to insert additional callbacks before this callback.<br/>
     * If `insert` is called in another callback during the invoking of the callback list, the new callback is guaranteed not to be triggered during the same callback list invoking.
     * The time complexity is O(1).
     *
     * @param {Callback} callback
     * @param {(Callback | CallbackNode | null | undefined)} before
     * @returns {CallbackNode}
     * @memberof CallbackList
     */
    public insert(callback: Callback, before: Callback | CallbackNode | null | undefined): CallbackNode {
        const beforeNode = this._doFindNode(before);
        if (!beforeNode) {
            return this.append(callback);
        }

        const node = new CallbackNode(callback, this._getNextCounter());

        node.previous = beforeNode.previous;
        node.next = beforeNode;
        if (beforeNode.previous) {
            beforeNode.previous.next = node;
        }
        beforeNode.previous = node;

        if (beforeNode === this._head) {
            this._head = node;
        }

        return node;
    }

    /**
     * Remove the callback from the callback list.<br/>
     * *callback* can be a callback function, or a handle object.<br/>
     * Return true if the callback is removed successfully, false if the callback is not found.<br/>
     * The time complexity is O(1).
     *
     * @param {(Callback | CallbackNode | null | undefined)} handle
     * @returns {boolean}
     * @memberof CallbackList
     */
    public remove(handle: Callback | CallbackNode | null | undefined): boolean {
        const node = this._doFindNode(handle);
        if (!node) {
            return false;
        }

        if (node.next) {
            node.next.previous = node.previous;
        }
        if (node.previous) {
            node.previous.next = node.next;
        }

        if (this._head === node) {
            this._head = node.next;
        }
        if (this._tail === node) {
            this._tail = node.previous;
        }

        // Mark it as deleted
        node.counter = 0;

        return true;
    }

    /**
     * Return true if the callback list is empty.
     *
     * @returns {boolean}
     * @memberof CallbackList
     */
    public empty(): boolean {
        return !this._head;
    }

    /**
     * Return true if the callback list contains *callback*.<br/>
     * *callback* can be a callback function, or a handle object.
     *
     * @param {(Callback | CallbackNode | null | undefined)} handle
     * @returns {boolean}
     * @memberof CallbackList
     */
    public has(handle: Callback | CallbackNode | null | undefined): boolean {
        return !!this._doFindNode(handle);
    }

    /**
     * Return true if the callback list contains any callback.
     *
     * @returns
     * @memberof CallbackList
     */
    public hasAny() {
        return !!this._head;
    }

    /**
     * Apply func to all callbacks.<br/>
     * The `func` receives one parameter which is the callback.<br/>
     * **Note**: the func can remove any callbacks, or add other callbacks, safely.
     *
     * @param {(callback: Callback) => any} func
     * @memberof CallbackList
     */
    public forEach(func: (callback: Callback) => any): void {
        let node = this._head;
        const counter = this._currentCounter;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                func(node.callback);
            }
            node = node.next;
        }
    }

    /**
     * Apply func to all callbacks. func must return a boolean value, and if the return value is false, forEachIf stops the looping immediately.<br/>
     * Return true if all callbacks are invoked, or event is not found, false if func returns false.
     *
     * @param {(callback: Callback) => any} func
     * @returns {boolean}
     * @memberof CallbackList
     */
    public forEachIf(func: (callback: Callback) => any): boolean {
        let node = this._head;
        const counter = this._currentCounter;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                if (!func(node.callback)) {
                    return false;
                }
            }

            node = node.next;
        }

        return true;
    }

    /**
     * Invoke each callbacks in the callback list.<br/>
     * The callbacks are called with arguments `arg1`, `arg2`, etc.
     *
     * @param {...any[]} args
     * @memberof CallbackList
     */
    public dispatch(...args: any[]): void {
        this._dispatch(...args);
    }

    /**
     * Invoke each callbacks in the callback list.<br/>
     * The callbacks are called with arguments `arg1`, `arg2`, etc.<br/>
     * Note the arguments are passed in an array, similar to Function.prototype.apply.
     *
     * @param {...any[]} args
     * @memberof CallbackList
     */
    public applyDispatch(...args: any[]): void {
        this._applyDispatch(...args);
    }

    private _getNextCounter() {
        let result = ++this._currentCounter;
        if (result === 0) {
            // overflow, let's reset all nodes' counters.
            let node = this._head;
            while (node) {
                node.counter = 1;
                node = node.next;
            }
            result = ++this._currentCounter;
        }

        return result;
    }

    private _doFindNode(handle: Callback | CallbackNode | null | undefined) {
        let node = this._head;
        while (node) {
            if (node === handle || node.callback === handle) {
                return node;
            }
            node = node.next;
        }

        return null;
    }

    private _dispatchArgumentsAsArray(...args: any[]) {
        const counter = this._currentCounter;
        let node = this._head;
        const canContinueInvoking = this._canContinueInvoking;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                node.callback.call(this, args);
                if (canContinueInvoking && !canContinueInvoking.call(this, args)) {
                    break;
                }
            }
            node = node.next;
        }
    }

    private _dispatchNotArgumentsAsArray(...args: any[]) {
        const counter = this._currentCounter;
        let node = this._head;
        const canContinueInvoking = this._canContinueInvoking;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                node.callback.apply(this, args);
                if (canContinueInvoking && !canContinueInvoking.apply(this, args)) {
                    break;
                }
            }
            node = node.next;
        }
    }

    private _applyDispatchArgumentsAsArray(...args: any[]) {
        const counter = this._currentCounter;
        let node = this._head;
        const canContinueInvoking = this._canContinueInvoking;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                node.callback.call(this, args);
                if (canContinueInvoking && !canContinueInvoking.call(this, args)) {
                    break;
                }
            }
            node = node.next;
        }
    }

    private _applyDispatchNotArgumentsAsArray(...args: any[]) {
        const counter = this._currentCounter;
        let node = this._head;
        const canContinueInvoking = this._canContinueInvoking;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                node.callback.apply(this, args);
                if (canContinueInvoking && !canContinueInvoking.apply(this, args)) {
                    break;
                }
            }
            node = node.next;
        }
    }
}
