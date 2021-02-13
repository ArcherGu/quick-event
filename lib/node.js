export class Node {
    constructor(callback, counter) {
        this.callback = callback;
        this.counter = counter;
        this.previous = null;
        this.next = null;
    }
}
