import { Node } from './node';
import { Callback, EventjsParams } from './types';
export declare class CallbackList {
    private _head;
    private _tail;
    private _currentCounter;
    private _canContinueInvoking;
    private _argumentsAsArray;
    private _dispatch;
    private _applyDispatch;
    constructor(params?: EventjsParams);
    append(callback: Callback): Node;
    prepend(callback: Callback): Node;
    insert(callback: Callback, before: Callback | Node): Node;
    remove(handle: Callback | Node): boolean;
    empty(): boolean;
    has(handle: Callback | Node): boolean;
    hasAny(): boolean;
    forEach(func: (callback: Callback) => any): void;
    forEachIf(func: (callback: Callback) => any): boolean;
    dispatch(...args: any[]): void;
    applyDispatch(...args: any[]): void;
    private _getNextCounter;
    private _doFindNode;
    private _dispatchArgumentsAsArray;
    private _dispatchNotArgumentsAsArray;
    private _applyDispatchArgumentsAsArray;
    private _applyDispatchNotArgumentsAsArray;
}
