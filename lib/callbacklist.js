import { Node } from './node';
export class CallbackList {
    constructor(params) {
        this._head = null;
        this._tail = null;
        this._currentCounter = 0;
        params = params || {};
        this._canContinueInvoking = params.hasOwnProperty('canContinueInvoking') ? params.canContinueInvoking : null;
        this._argumentsAsArray = params.hasOwnProperty('argumentsAsArray') ? !!params.argumentsAsArray : false;
        if (this._argumentsAsArray) {
            this._dispatch = this._dispatchArgumentsAsArray;
            this._applyDispatch = this._applyDispatchArgumentsAsArray;
        }
        else {
            this._dispatch = this._dispatchNotArgumentsAsArray;
            this._applyDispatch = this._applyDispatchNotArgumentsAsArray;
        }
    }
    append(callback) {
        const node = new Node(callback, this._getNextCounter());
        if (this._head) {
            node.previous = this._tail;
            this._tail = node;
            this._tail.next = node;
        }
        else {
            this._head = node;
            this._tail = node;
        }
        return node;
    }
    prepend(callback) {
        const node = new Node(callback, this._getNextCounter());
        if (this._head) {
            node.next = this._head;
            this._head.previous = node;
            this._head = node;
        }
        else {
            this._head = node;
            this._tail = node;
        }
        return node;
    }
    insert(callback, before) {
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
    remove(handle) {
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
    empty() {
        return !this._head;
    }
    has(handle) {
        return !!this._doFindNode(handle);
    }
    hasAny() {
        return !!this._head;
    }
    forEach(func) {
        let node = this._head;
        const counter = this._currentCounter;
        while (node) {
            if (node.counter !== 0 && counter >= node.counter) {
                func(node.callback);
            }
            node = node.next;
        }
    }
    forEachIf(func) {
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
    dispatch(...args) {
        this._dispatch(...args);
    }
    applyDispatch(...args) {
        this._applyDispatch(...args);
    }
    _getNextCounter() {
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
    _doFindNode(handle) {
        let node = this._head;
        while (node) {
            if (node === handle || node.callback === handle) {
                return node;
            }
            node = node.next;
        }
        return null;
    }
    _dispatchArgumentsAsArray(...args) {
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
    _dispatchNotArgumentsAsArray(...args) {
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
    _applyDispatchArgumentsAsArray(...args) {
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
    _applyDispatchNotArgumentsAsArray(...args) {
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
