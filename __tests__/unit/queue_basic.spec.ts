import { EventQueue } from "../../dist/quick-event";
import { checkArraysEqual } from "./utils";

describe('EventQueue', () => {
    it('string event', () => {
        let queue = new EventQueue();

        let a = 1;
        let b = 5;

        queue.appendListener("event1", () => {
            a = 2;
        });
        queue.appendListener("event1", () => {
            b = 8;
        });

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        queue.enqueue("event1");
        queue.process();

        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('int event', () => {
        let queue = new EventQueue();

        let a = 1;
        let b = 5;

        queue.appendListener(3, () => {
            a = 2;
        });
        queue.appendListener(3, () => {
            b = 8;
        });

        expect(a).not.toBe(2);
        expect(b).not.toBe(8);

        queue.enqueue(3);
        queue.process();

        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('processOne, int event', () => {
        let queue = new EventQueue();

        let a = 1;
        let b = 5;

        queue.appendListener(3, () => {
            a += 1;
        });
        queue.appendListener(5, () => {
            b += 3;
        });

        expect(a).toBe(1);
        expect(b).toBe(5);

        queue.enqueue(3);
        queue.enqueue(5);

        queue.processOne();
        expect(a).toBe(2);
        expect(b).toBe(5);

        queue.processOne();
        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('int event, params (string, int)', () => {
        let queue = new EventQueue();
        const event = 3;

        let sList = new Array(2);
        let iList = new Array(sList.length);

        queue.appendListener(event, (s, n) => {
            sList[0] = s;
            iList[0] = n;
        });
        queue.appendListener(event, (s, n) => {
            sList[1] = s + "2";
            iList[1] = n + 5;
        });

        expect(sList[0]).not.toBe('first');
        expect(sList[1]).not.toBe('first2');
        expect(iList[0]).not.toBe(3);
        expect(iList[1]).not.toBe(8);

        queue.enqueue(event, "first", 3);
        queue.process();

        expect(sList[0]).toBe('first');
        expect(sList[1]).toBe('first2');
        expect(iList[0]).toBe(3);
        expect(iList[1]).toBe(8);
    });

    it('customized event', () => {
        let queue = new EventQueue({
            getEvent: (e: any) => {
                return e.type;
            }
        });

        let a = "Hello ";
        let b = "World ";

        queue.appendListener(3, (e, s) => {
            a += e.message + s + e.param;
        });
        queue.appendListener(3, (e, s) => {
            b += e.message + s + e.param;
        });
        expect(a).toBe("Hello ");
        expect(b).toBe("World ");

        queue.enqueue({ type: 3, message: "very ", param: 38 }, "good");
        queue.process();

        expect(a).toBe("Hello very good38");
        expect(b).toBe("World very good38");
    });

    describe('peekEvent/takeEvent/applyDispatch', () => {
        let queue: EventQueue;
        const itemCount = 3;
        let dataList: number[];

        const add = (e, n) => {
            queue.enqueue(e, n);
        };

        const reset = () => {
            queue = new EventQueue();
            dataList = new Array(itemCount);
            dataList.fill(0);

            queue.appendListener(3, (n) => {
                ++dataList[n];
            });

            add(3, 0);
            add(3, 1);
            add(3, 2);
        };

        it("peek", () => {
            reset();

            let event = queue.peekEvent();
            expect(event).toBeTruthy();
            expect(event[0]).toBe(3);
            expect(event[1]).toBe(0);
        });

        it("peek/peek", () => {
            reset();

            let event = queue.peekEvent();
            expect(event).toBeTruthy();
            expect(event[0]).toBe(3);
            expect(event[1]).toBe(0);

            let event2 = queue.peekEvent();
            expect(event2).toBeTruthy();
            expect(event2[0]).toBe(3);
            expect(event2[1]).toBe(0);
        });

        it("peek/take", () => {
            reset();

            let event = queue.peekEvent();
            expect(event).toBeTruthy();
            expect(event[0]).toBe(3);
            expect(event[1]).toBe(0);

            let event2 = queue.takeEvent();
            expect(event2).toBeTruthy();
            expect(event2[0]).toBe(3);
            expect(event2[1]).toBe(0);
        });

        it("peek/take/peek", () => {
            reset();

            let event = queue.peekEvent();
            expect(event).toBeTruthy();
            expect(event[0]).toBe(3);
            expect(event[1]).toBe(0);

            let event2 = queue.takeEvent();
            expect(event2).toBeTruthy();
            expect(event2[0]).toBe(3);
            expect(event2[1]).toBe(0);

            let event3 = queue.peekEvent();
            expect(event3).toBeTruthy();
            expect(event3[0]).toBe(3);
            expect(event3[1]).toBe(1);
        });

        it("peek/dispatch/peek/dispatch again", () => {
            reset();

            let event = queue.peekEvent();
            expect(event).toBeTruthy();
            expect(event[0]).toBe(3);
            expect(event[1]).toBe(0);

            queue.applyDispatch(event);

            let event2 = queue.takeEvent();
            expect(event2).toBeTruthy();
            expect(event2[0]).toBe(3);
            expect(event2[1]).toBe(0);

            expect(checkArraysEqual(dataList, [1, 0, 0])).toBeTruthy();

            queue.applyDispatch(event);

            expect(checkArraysEqual(dataList, [2, 0, 0])).toBeTruthy();
        });

        it("process", () => {
            reset();

            // test the queue works with simple process(), ensure the process()
            // in the next "take all/process" works correctly.
            expect(checkArraysEqual(dataList, [0, 0, 0])).toBeTruthy();
            queue.process();
            expect(checkArraysEqual(dataList, [1, 1, 1])).toBeTruthy();
        });

        it("take all/process", () => {
            reset();

            for (let i = 0; i < itemCount; ++i) {
                expect(queue.takeEvent()).toBeTruthy();
            }

            expect(!queue.peekEvent()).toBeTruthy();
            expect(!queue.takeEvent()).toBeTruthy();

            expect(checkArraysEqual(dataList, [0, 0, 0])).toBeTruthy();
            queue.process();
            expect(checkArraysEqual(dataList, [0, 0, 0])).toBeTruthy();
        });
    });

    it('clearEvents', () => {
        let queue = new EventQueue();

        let a = 1;
        let b = 5;

        queue.appendListener(3, () => {
            a += 1;
        });
        queue.appendListener(3, () => {
            b += 3;
        });

        expect(a).toBe(1);
        expect(b).toBe(5);

        queue.enqueue(3);
        queue.process();

        expect(a).toBe(2);
        expect(b).toBe(8);

        queue.enqueue(3);
        queue.clearEvents();
        queue.process();

        expect(a).toBe(2);
        expect(b).toBe(8);
    });

    it('processIf', () => {
        let queue = new EventQueue();

        let dataList = new Array(3);
        dataList.fill(0);

        queue.appendListener(5, () => {
            ++dataList[0];
        });
        queue.appendListener(6, () => {
            ++dataList[1];
        });
        queue.appendListener(7, () => {
            ++dataList[2];
        });

        expect(checkArraysEqual(dataList, [0, 0, 0])).toBeTruthy();

        queue.enqueue(5);
        queue.enqueue(6);
        queue.enqueue(7);
        queue.process();
        expect(checkArraysEqual(dataList, [1, 1, 1])).toBeTruthy();

        queue.enqueue(5);
        queue.enqueue(6);
        queue.enqueue(7);
        queue.processIf((event) => event === 6);
        expect(checkArraysEqual(dataList, [1, 2, 1])).toBeTruthy();
        // Now the queue contains 5, 7

        queue.enqueue(5);
        queue.enqueue(6);
        queue.enqueue(7);
        queue.processIf((event) => event === 5);
        expect(checkArraysEqual(dataList, [3, 2, 1])).toBeTruthy();
        // Now the queue contains 6, 7, 7

        queue.enqueue(5);
        queue.enqueue(6);
        queue.enqueue(7);
        queue.processIf((event) => event === 7);
        expect(checkArraysEqual(dataList, [3, 2, 4])).toBeTruthy();
        // Now the queue contains 5, 6, 6

        queue.process();
        expect(checkArraysEqual(dataList, [4, 4, 4])).toBeTruthy();
    });
});