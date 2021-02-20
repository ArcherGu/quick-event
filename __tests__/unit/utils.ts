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
        expect(!callbackList.head).toBeTruthy();
        expect(!callbackList.tail).toBeTruthy();
        return;
    }

    expect(!callbackList.head?.previous).toBeTruthy();
    expect(!callbackList.tail?.next).toBeTruthy();

    if (count === 1) {
        expect(callbackList.head).toBeTruthy();
        expect(callbackList.head).toEqual(callbackList.tail);
    }

    let node = callbackList.head;
    for (let i = 0; i < count; ++i) {
        expect(node).toBeTruthy();

        if (i === 0) {
            expect(!node?.previous).toBeTruthy();
            expect(node).toEqual(callbackList.head);
        }
        if (i === count - 1) {
            expect(!node?.next).toBeTruthy();
            expect(node).toEqual(callbackList.tail);
        }

        expect(node?.callback()).toEqual(dataList[i]);

        if (node) {
            node = node.next;
        }
    }
}

export function callbackFactory(id: number) { return () => id; };