import { Callback } from "../types";

export class CallbackNode {
    public previous: CallbackNode | null = null;
    public next: CallbackNode | null = null;
    constructor(public callback: Callback, public counter: number) { }
}