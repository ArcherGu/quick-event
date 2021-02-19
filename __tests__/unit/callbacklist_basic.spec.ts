import { CallbackList } from "../../src";
import { checkArraysEqual } from "./utils";

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
});