import { Callback } from "./types";

/**
 * CallbackNode is used to record the structure of callbacks.<br/>
 * The return value(`handle`) of some methods refers to CallbackNode.
 * 
 * **Note:** Do not directly modify the structure of CallbackNode!
 * 
 * @export
 * @class CallbackNode
 */
export class CallbackNode {
    public previous: CallbackNode | null = null;
    public next: CallbackNode | null = null;
    constructor(public callback: Callback, public counter: number) { }
}