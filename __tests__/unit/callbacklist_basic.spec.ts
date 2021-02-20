import { CallbackList, CallbackNode } from "../../src";
import { callbackFactory, checkArraysEqual, verifyLinkedList } from "./utils";

describe('CallbackList', () => {
    it('nested callbacks, new callbacks should not be triggered', () => {
        const callbackList = new CallbackList();
        let a = 0, b = 0;
        callbackList.append(() => {
            a = 1;

            const h1 = callbackList.append(() => {
                ++b;

                callbackList.append(() => {
                    ++b;
                });
                const h2 = callbackList.prepend(() => {
                    ++b;
                    callbackList.append(() => {
                        ++b;
                    });
                });

                callbackList.append(() => {
                    ++b;
                });

                callbackList.insert(() => {
                    ++b;
                }, h2);

                callbackList.prepend(() => {
                    ++b;
                });
            });

            callbackList.prepend(() => {
                ++b;
            });

            callbackList.insert(() => {
                ++b;
            }, h1);
        });

        callbackList.append(() => { });

        expect(a).toBe(0);
        expect(b).toBe(0);

        callbackList.dispatch();
        expect(a).toBe(1);
        expect(b).toBe(0);

        callbackList.dispatch();
        expect(a).toBe(1);
        expect(b).toBe(3); // there are 3 new top level callback

        b = 0;
        callbackList.dispatch();
        expect(a).toBe(1);
        expect(b).toBeGreaterThan(3);
    });

    it('remove inside callback', () => {
        const removalTester = (callbackCount: number, removerIndex: number, indexesToBeRemoved: number[]) => {
            let callbackList = new CallbackList();
            let handleList = new Array(callbackCount);
            let dataList = new Array(callbackCount);
            dataList.fill(0);

            for (let i = 0; i < callbackCount; ++i) {
                if (i === removerIndex) {
                    handleList[i] = callbackList.append(() => {
                        dataList[i] = i + 1;

                        for (let index of indexesToBeRemoved) {
                            callbackList.remove(handleList[index]);
                        }
                    });
                }
                else {
                    handleList[i] = callbackList.append(() => {
                        dataList[i] = i + 1;
                    });
                }
            }

            callbackList.dispatch();

            let compareList = new Array(callbackCount);
            for (let i = 0; i < compareList.length; ++i) {
                compareList[i] = i + 1;
            }

            for (let index of indexesToBeRemoved) {
                if (index > removerIndex) {
                    compareList[index] = 0;
                }
            }

            return checkArraysEqual(dataList, compareList);
        };

        expect(removalTester(7, 3, [0])).toBeTruthy();
        expect(removalTester(7, 3, [1])).toBeTruthy();
        expect(removalTester(7, 3, [2])).toBeTruthy();
        expect(removalTester(7, 3, [3])).toBeTruthy();
        expect(removalTester(7, 3, [4])).toBeTruthy();
        expect(removalTester(7, 3, [5])).toBeTruthy();
        expect(removalTester(7, 3, [6])).toBeTruthy();

        expect(removalTester(7, 3, [0, 3])).toBeTruthy();
        expect(removalTester(7, 3, [3, 0])).toBeTruthy();
        expect(removalTester(7, 3, [1, 3])).toBeTruthy();
        expect(removalTester(7, 3, [3, 1])).toBeTruthy();
        expect(removalTester(7, 3, [2, 3])).toBeTruthy();
        expect(removalTester(7, 3, [3, 2])).toBeTruthy();
        expect(removalTester(7, 3, [3, 4])).toBeTruthy();
        expect(removalTester(7, 3, [4, 3])).toBeTruthy();
        expect(removalTester(7, 3, [3, 5])).toBeTruthy();
        expect(removalTester(7, 3, [5, 3])).toBeTruthy();
        expect(removalTester(7, 3, [3, 6])).toBeTruthy();
        expect(removalTester(7, 3, [6, 3])).toBeTruthy();

        expect(removalTester(7, 3, [2, 4])).toBeTruthy();
        expect(removalTester(7, 3, [4, 2])).toBeTruthy();
        expect(removalTester(7, 3, [0, 6])).toBeTruthy();
        expect(removalTester(7, 3, [0, 0])).toBeTruthy();

        expect(removalTester(7, 3, [4, 5])).toBeTruthy();
        expect(removalTester(7, 3, [5, 4])).toBeTruthy();

        expect(removalTester(7, 3, [3, 4, 5])).toBeTruthy();
        expect(removalTester(7, 3, [3, 5, 4])).toBeTruthy();

        expect(removalTester(7, 3, [0, 1, 2, 3, 4, 5, 6])).toBeTruthy();
        expect(removalTester(7, 3, [6, 5, 4, 3, 2, 1, 0])).toBeTruthy();
        expect(removalTester(7, 3, [0, 2, 1, 3, 5, 4, 6])).toBeTruthy();
        expect(removalTester(7, 3, [6, 4, 5, 3, 1, 2, 0])).toBeTruthy();
    });

    describe("forEach and forEachIf", () => {
        let callbackList = new CallbackList();
        const itemCount = 5;
        let dataList = new Array(itemCount);
        for (let i = 0; i < itemCount; ++i) {
            callbackList.append(() => {
                dataList[i] = i + 1;
            });
        }

        it('forEach', () => {
            dataList.fill(0);
            callbackList.forEach((callback) => {
                callback();
            });

            expect(checkArraysEqual(dataList, [1, 2, 3, 4, 5])).toBeTruthy();
        });

        it('forEachIf', () => {
            dataList.fill(0);
            const result = callbackList.forEachIf((callback) => {
                const index = 2;
                const isZero = (dataList[index] == 0);
                callback();
                if (isZero && dataList[index] != 0) {
                    return false;
                }
                return true;
            });

            expect(!result).toBeTruthy();
            expect(checkArraysEqual(dataList, [1, 2, 3, 0, 0])).toBeTruthy();
        });
    });

    it('append/remove/insert', () => {
        let callbackList = new CallbackList();
        let h100: CallbackNode,
            h101: CallbackNode,
            h102: CallbackNode,
            h103: CallbackNode,
            h104: CallbackNode,
            h105: CallbackNode,
            h106: CallbackNode,
            h107: CallbackNode;

        {
            let handle = callbackList.append(callbackFactory(100));
            h100 = handle;
            verifyLinkedList(callbackList, [100]);
        }

        {
            let handle = callbackList.append(callbackFactory(101));
            h101 = handle;
            verifyLinkedList(callbackList, [100, 101]);
        }

        {
            let handle = callbackList.append(callbackFactory(102));
            h102 = handle;
            verifyLinkedList(callbackList, [100, 101, 102]);
        }

        {
            let handle = callbackList.append(callbackFactory(103));
            h103 = handle;
            verifyLinkedList(callbackList, [100, 101, 102, 103]);
        }

        {
            let handle = callbackList.append(callbackFactory(104));
            h104 = handle;
            verifyLinkedList(callbackList, [100, 101, 102, 103, 104]);
        }

        {
            let handle = callbackList.insert(callbackFactory(105), h103); // before 103
            h105 = handle;
            verifyLinkedList(callbackList, [100, 101, 102, 105, 103, 104]);

            h107 = callbackList.insert(callbackFactory(107), h100); // before 100
            verifyLinkedList(callbackList, [107, 100, 101, 102, 105, 103, 104]);

            h106 = callbackList.insert(callbackFactory(106), handle); // before 105
            verifyLinkedList(callbackList, [107, 100, 101, 102, 106, 105, 103, 104]);
        }

        callbackList.remove(h100);
        verifyLinkedList(callbackList, [107, 101, 102, 106, 105, 103, 104]);

        callbackList.remove(h103);
        callbackList.remove(h102);
        verifyLinkedList(callbackList, [107, 101, 106, 105, 104]);

        callbackList.remove(h105);
        callbackList.remove(h104);
        callbackList.remove(h106);
        callbackList.remove(h101);
        callbackList.remove(h107);
        verifyLinkedList(callbackList, []);
    });

    describe('insert', () => {
        let callbackList: CallbackList;
        let h100: CallbackNode,
            h101: CallbackNode,
            h102: CallbackNode,
            h103: CallbackNode,
            h104: CallbackNode;

        let reset = () => {
            callbackList = new CallbackList();
            h100 = callbackList.append(callbackFactory(100));
            h101 = callbackList.append(callbackFactory(101));
            h102 = callbackList.append(callbackFactory(102));
            h103 = callbackList.append(callbackFactory(103));
            h104 = callbackList.append(callbackFactory(104));
        };

        it('before front', () => {
            reset();

            callbackList.insert(callbackFactory(105), h100);
            verifyLinkedList(callbackList, [105, 100, 101, 102, 103, 104]);
        });

        it('before second', () => {
            reset();

            callbackList.insert(callbackFactory(105), h101);
            verifyLinkedList(callbackList, [100, 105, 101, 102, 103, 104]);
        });

        it('before nonexist', () => {
            reset();

            callbackList.insert(callbackFactory(105), null);
            verifyLinkedList(callbackList, [100, 101, 102, 103, 104, 105]);
        });
    });

    describe('remove', () => {
        let callbackList: CallbackList;
        let h100: CallbackNode,
            h101: CallbackNode,
            h102: CallbackNode,
            h103: CallbackNode,
            h104: CallbackNode;

        let reset = () => {
            callbackList = new CallbackList();
            h100 = callbackList.append(callbackFactory(100));
            h101 = callbackList.append(callbackFactory(101));
            h102 = callbackList.append(callbackFactory(102));
            h103 = callbackList.append(callbackFactory(103));
            h104 = callbackList.append(callbackFactory(104));
        };

        it('remove front', () => {
            reset();

            callbackList.remove(h100);
            verifyLinkedList(callbackList, [101, 102, 103, 104]);

            callbackList.remove(h100);
            verifyLinkedList(callbackList, [101, 102, 103, 104]);
        });

        it('remove second', () => {
            reset();

            callbackList.remove(h101);
            verifyLinkedList(callbackList, [100, 102, 103, 104]);

            callbackList.remove(h101);
            verifyLinkedList(callbackList, [100, 102, 103, 104]);
        });

        it('remove end', () => {
            reset();

            callbackList.remove(h104);
            verifyLinkedList(callbackList, [100, 101, 102, 103]);

            callbackList.remove(h104);
            verifyLinkedList(callbackList, [100, 101, 102, 103]);
        });

        it('remove nonexist', () => {
            reset();

            callbackList.remove(null);
            verifyLinkedList(callbackList, [100, 101, 102, 103, 104]);

            callbackList.remove(null);
            verifyLinkedList(callbackList, [100, 101, 102, 103, 104]);
        });

        it('remove all', () => {
            reset();

            callbackList.remove(h102);
            callbackList.remove(h104);
            callbackList.remove(h103);
            callbackList.remove(h101);
            callbackList.remove(h100);
            verifyLinkedList(callbackList, []);
        });
    });

    it('has', () => {
        let callbackList = new CallbackList();
        let h100: CallbackNode | null = null;
        let h101: CallbackNode | null = null;

        expect(!callbackList.has(h100)).toBeTruthy();
        expect(!callbackList.has(h101)).toBeTruthy();

        h100 = callbackList.append(callbackFactory(100));
        expect(callbackList.has(h100)).toBeTruthy();
        expect(!callbackList.has(h101)).toBeTruthy();

        h101 = callbackList.append(callbackFactory(101));
        expect(callbackList.has(h100)).toBeTruthy();
        expect(callbackList.has(h101)).toBeTruthy();

        callbackList.remove(h100);
        expect(!callbackList.has(h100)).toBeTruthy();
        expect(callbackList.has(h101)).toBeTruthy();

        callbackList.remove(h101);
        expect(!callbackList.has(h100)).toBeTruthy();
        expect(!callbackList.has(h101)).toBeTruthy();
    });

    it('hasAny', () => {

    });
});