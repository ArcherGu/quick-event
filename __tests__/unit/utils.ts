import { CallbackList } from "../../src";

export function checkArraysEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export function verifyLinkedList(callbackList: CallbackList, dataList: number[]) {
    const count = dataList.length;
    if (count === 0) {
        expect(!callbackList.getHead()).toBeTruthy();
        expect(!callbackList.getTail()).toBeTruthy();
        return;
    }

    expect(!callbackList.getHead()?.previous).toBeTruthy();
    expect(!callbackList.getTail()?.next).toBeTruthy();

    if (count === 1) {
        expect(callbackList.getHead()).toBeTruthy();
        expect(callbackList.getHead()).toEqual(callbackList.getTail());
    }

    let node = callbackList.getHead();
    for (let i = 0; i < count; ++i) {
        expect(node).toBeTruthy();

        if (i === 0) {
            expect(!node?.previous).toBeTruthy();
            expect(node).toEqual(callbackList.getHead());
        }
        if (i === count - 1) {
            expect(!node?.next).toBeTruthy();
            expect(node).toEqual(callbackList.getTail());
        }

        expect(node?.callback()).toEqual(dataList[i]);

        if (node) {
            node = node.next;
        }
    }
}