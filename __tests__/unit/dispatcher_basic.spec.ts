import { EventDispatcher, CallbackNode, MixinFilter } from "../../dist/quick-event";
import { callbackFactory, checkArraysEqual } from "./utils";

describe('EventDispatcher', () => {
    it('string event', () => {
        let dispatcher = new EventDispatcher();

        let a = 1;
        let b = 5;

        dispatcher.appendListener("event1", () => {
            a = 2;
        });
        dispatcher.appendListener("event1", () => {
            b = 8;
        });

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        dispatcher.dispatch("event1");

        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('int event', () => {
        let dispatcher = new EventDispatcher();

        let a = 1;
        let b = 5;

        dispatcher.appendListener(3, () => {
            a = 2;
        });
        dispatcher.appendListener(3, () => {
            b = 8;
        });

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        dispatcher.dispatch(3);

        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('add/remove, int event', () => {
        let dispatcher = new EventDispatcher();
        const event = 3;

        let a = 1;
        let b = 5;

        let ha: CallbackNode | null,
            hb: CallbackNode | null;

        ha = dispatcher.appendListener(event, () => {
            a = 2;
            dispatcher.removeListener(event, hb);
            dispatcher.removeListener(event, ha);
            ha = null;
            hb = null;
        });
        hb = dispatcher.appendListener(event, () => {
            b = 8;
        });

        expect(ha).toBeTruthy();
        expect(hb).toBeTruthy();

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        dispatcher.dispatch(event);

        expect(!ha).toBeTruthy();
        expect(!hb).toBeTruthy();

        expect(a).toBe(2);
        expect(b).not.toBe(8);

        a = 1;
        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        dispatcher.dispatch(event);
        expect(a).not.toBe(2);
        expect(b).not.toBe(8);
    });

    it('add another listener inside a listener, int event', () => {
        let dispatcher = new EventDispatcher();
        const event = 3;

        let a = 1;
        let b = 5;

        dispatcher.appendListener(event, () => {
            a = 2;
            dispatcher.appendListener(event, () => {
                b = 8;
            });
        });

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        dispatcher.dispatch(event);

        expect(a).toBe(2);
        expect(b).not.toBe(8);
    });

    it('inside EventDispatcher, int event', () => {
        let dispatcher = new EventDispatcher();
        const event1 = 3;
        const event2 = 5;

        let a = 1;
        let b = 5;

        let ha: CallbackNode | null,
            hb: CallbackNode | null;

        ha = dispatcher.appendListener(event1, () => {
            a = 2;
            dispatcher.dispatch(event2);
        });
        hb = dispatcher.appendListener(event2, () => {
            b = 8;
            dispatcher.removeListener(event1, ha);
            dispatcher.removeListener(event2, hb);
            ha = null;
            hb = null;
        });

        expect(ha).toBeTruthy();
        expect(hb).toBeTruthy();

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        dispatcher.dispatch(event1);

        expect(!ha).toBeTruthy();
        expect(!hb).toBeTruthy();

        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('inside EventDispatcher, int event, params (string, int)', () => {
        let dispatcher = new EventDispatcher();
        const event = 3;

        let sList = new Array(2);
        let iList = new Array(sList.length);

        dispatcher.appendListener(event, (s, i) => {
            sList[0] = s;
            iList[0] = i;
        });
        dispatcher.appendListener(event, (s, i) => {
            sList[1] = s + "2";
            iList[1] = i + 5;
        });

        expect(sList[0]).not.toBe('first');
        expect(sList[1]).not.toBe('first2');
        expect(iList[0]).not.toBe(3);
        expect(iList[1]).not.toBe(8);

        dispatcher.dispatch(event, "first", 3);

        expect(sList[0]).toBe('first');
        expect(sList[1]).toBe('first2');
        expect(iList[0]).toBe(3);
        expect(iList[1]).toBe(8);
    });

    it('hasListener', () => {
        let dispatcher = new EventDispatcher();

        let c103 = callbackFactory(103);
        let c105 = callbackFactory(105);

        expect(!dispatcher.hasListener(3, c103)).toBeTruthy();
        expect(!dispatcher.hasListener(5, c105)).toBeTruthy();

        dispatcher.appendListener(3, c103);
        expect(dispatcher.hasListener(3, c103)).toBeTruthy();
        expect(!dispatcher.hasListener(5, c105)).toBeTruthy();

        dispatcher.appendListener(5, c105);
        expect(dispatcher.hasListener(3, c103)).toBeTruthy();
        expect(dispatcher.hasListener(5, c105)).toBeTruthy();

        dispatcher.removeListener(3, c103);
        expect(!dispatcher.hasListener(3, c103)).toBeTruthy();
        expect(dispatcher.hasListener(5, c105)).toBeTruthy();

        dispatcher.removeListener(5, c105);
        expect(!dispatcher.hasListener(3, c103)).toBeTruthy();
        expect(!dispatcher.hasListener(5, c105)).toBeTruthy();
    });

    it('hasAnyListener', () => {
        let dispatcher = new EventDispatcher();
        let c103 = callbackFactory(103);
        let c105 = callbackFactory(105);

        expect(!dispatcher.hasAnyListener(3)).toBeTruthy();
        expect(!dispatcher.hasAnyListener(5)).toBeTruthy();

        dispatcher.appendListener(3, c103);
        expect(dispatcher.hasAnyListener(3)).toBeTruthy();
        expect(!dispatcher.hasAnyListener(5)).toBeTruthy();

        dispatcher.appendListener(5, c105);
        expect(dispatcher.hasAnyListener(3)).toBeTruthy();
        expect(dispatcher.hasAnyListener(5)).toBeTruthy();

        dispatcher.removeListener(3, c103);
        expect(!dispatcher.hasAnyListener(3)).toBeTruthy();
        expect(dispatcher.hasAnyListener(5)).toBeTruthy();

        dispatcher.removeListener(5, c105);
        expect(!dispatcher.hasAnyListener(3)).toBeTruthy();
        expect(!dispatcher.hasAnyListener(5)).toBeTruthy();
    });

    describe('event filter', () => {
        let dispatcher: EventDispatcher;

        const itemCount = 5;
        const filterCount = 2;
        let dataList = new Array(itemCount);
        let filterData = new Array(filterCount);

        const reset = () => {
            dataList.fill(0);
            filterData.fill(0);

            dispatcher = new EventDispatcher({
                mixins: [new MixinFilter()],
                argumentPassingMode: EventDispatcher.argumentPassingIncludeEvent
            });

            for (let i = 0; i < itemCount; ++i) {
                dispatcher.appendListener(i, (e: any, index: any) => {
                    dataList[e] = index;
                });
            }
        };

        it("Filter invoked count", () => {
            reset();

            (dispatcher as any).appendFilter(() => {
                ++filterData[0];
                return true;
            });
            (dispatcher as any).appendFilter(() => {
                ++filterData[1];
                return true;
            });

            for (let i = 0; i < itemCount; ++i) {
                dispatcher.dispatch(i, 58);
            }
            expect(checkArraysEqual(filterData, [itemCount, itemCount])).toBeTruthy();
            expect(checkArraysEqual(dataList, [58, 58, 58, 58, 58])).toBeTruthy();
        });

        it("First filter blocks all other filters and listeners", () => {
            reset();

            (dispatcher as any).appendFilter((args: any[]) => {
                ++filterData[0];
                if (args[0] >= 2) {
                    return false;
                }
                return true;
            });
            (dispatcher as any).appendFilter(() => {
                ++filterData[1];
                return true;
            });

            for (let i = 0; i < itemCount; ++i) {
                dispatcher.dispatch(i, 58);
            }

            expect(checkArraysEqual(filterData, [itemCount, 2])).toBeTruthy();
            expect(checkArraysEqual(dataList, [58, 58, 0, 0, 0])).toBeTruthy();
        });

        it("Second filter doesn't block first filter but all listeners", () => {
            reset();

            (dispatcher as any).appendFilter(() => {
                ++filterData[0];
                return true;
            });
            (dispatcher as any).appendFilter((args: any[]) => {
                ++filterData[1];
                if (args[0] >= 2) {
                    return false;
                }
                return true;
            });

            for (let i = 0; i < itemCount; ++i) {
                dispatcher.dispatch(i, 58);
            }

            expect(checkArraysEqual(filterData, [itemCount, itemCount])).toBeTruthy();
            expect(checkArraysEqual(dataList, [58, 58, 0, 0, 0])).toBeTruthy();
        });

        it("Filter manipulates the parameters", () => {
            reset();

            (dispatcher as any).appendFilter((args: any[]) => {
                ++filterData[0];
                if (args[0] >= 2) {
                    ++args[1];
                }
                return true;
            });
            (dispatcher as any).appendFilter(() => {
                ++filterData[1];
                return true;
            });

            for (let i = 0; i < itemCount; ++i) {
                dispatcher.dispatch(i, 58);
            }

            expect(checkArraysEqual(filterData, [itemCount, itemCount])).toBeTruthy();
            expect(checkArraysEqual(dataList, [58, 58, 59, 59, 59])).toBeTruthy();
        });
    });
});