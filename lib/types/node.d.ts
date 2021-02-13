import { Callback } from "./types";
export declare class Node {
    callback: Callback;
    counter: number;
    previous: Node | null;
    next: Node | null;
    constructor(callback: Callback, counter: number);
}
