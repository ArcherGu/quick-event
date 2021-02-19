import { Node } from './helper/node';
import { Callback, EventjsParams } from './types';

export class CallbackList {
    private _head: Node | null = null;
    private _tail: Node | null = null;
    private _currentCounter: number = 0;
    private _canContinueInvoking: ((...args: any[]) => boolean) | null | undefined;
    private _argumentsAsArray: boolean;
    private _dispatch: (...args: any[]) => any;
    private _applyDispatch: (...args: any[]) => any;

    constructor(params?: EventjsParams) {
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

    public append(callback: Callback): Node {
        const node = new Node(callback, this._getNextCounter());

        if (this._head) {
            node.previous = this._tail;
            this._tail = node;
            this._tail.next = node;
        } else {
            this._head = node;
            this._tail = node;
        }

        return node;
    }

    public prepend(callback: Callback): Node {
        const node = new Node(callback, this._getNextCounter());

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

    public insert(callback: Callback, before: Callback | Node): Node {
        const beforeNode = this._doFindNode(before);
        if (!beforeNode) {
            return this.append(callback);
        }

        const node = new Node(callback, this._getNextCounter());

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

    public remove(handle: Callback | Node): boolean {
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

    public empty(): boolean {
        return !this._head;
    }

    public has(handle: Callback | Node): boolean {
        return !!this._doFindNode(handle);
    }

    public hasAny() {
        return !!this._head;
    }

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

    public dispatch(...args: any[]): void {
        this._dispatch(...args);
    }

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

    private _doFindNode(handle: Callback | Node) {
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
