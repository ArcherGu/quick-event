import { Callback } from "./types";

export class Node {
    public previous: Node | null = null;
    public next: Node | null = null;
    constructor(public callback: Callback, public counter: number) { }
}