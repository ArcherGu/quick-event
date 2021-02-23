import { MixinFilter } from './mixins/mixin_filter';

export enum ArgumentPassingMode {
    IncludeEvent = 1,
    ExcludeEvent
}
/**
 * All classes [CallbackList](https://archergu.github.io/quick-event/classes/callback_list.callbacklist.html), [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html) and [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html) in quick-event accepts a parameters object in constructor to configure and extend each components' behavior. The parameters object is `undefined` by default.<br/>
 * All parameters are optional. If any parameter is omitted, the default value is used.<br/>
 * The same parameter mechanism applies to all three classes, [CallbackList](https://archergu.github.io/quick-event/classes/callback_list.callbacklist.html), [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html) and [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html), though not all classes requires the same parameter.
 *
 * @export
 * @interface QuickEventParams
 */
export interface QuickEventParams {
    /**
     * The function receives same arguments as [EventDispatcher.dispatch](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html#dispatch) and [EventQueue.enqueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html#enqueue), and must return an event type.<br/>
     * quick-event forwards all arguments of [EventDispatcher.dispatch](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html#dispatch) and [EventQueue.enqueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html#enqueue) (both has same arguments) to getEvent to get the event type, then invokes the callback list of the event type.
     * 
     * @apply [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html), [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html)
     * @default the default implementation returns the first argument of `getEvent`
     * @memberof QuickEventParams
     * @example ```javascript
     * // The event object we will dispatch looks like,
     * // MyEvent = {
     * //   type: int,
     * //   message: string,
     * //   param: int
     * //};
     *
     * // When construct the dispatcher, pass the parameter
     * // getEvent to indicate how to get the event type.
     * let dispatcher = new EventDispatcher({
     *   getEvent: (e) => e.type
     * });
     *
     * // Add a listener.
     * // Note: the first argument is the event type of type int (same as the return type of getEvent), not MyEvent.
     * // e is the main event object.
     * // b is an extra parameter.
     * dispatcher.appendListener(3, (e, b) => {
     *   console.log("Got event 3");
     *   console.log("Event::type is", e.type);
     *   console.log("Event::message is", e.message);
     *   console.log("Event::param is", e.param);
     *   console.log("b is", b);
     * });
     *
     * // Dispatch the event.
     * // The first argument is MyEvent.
     * dispatcher.dispatch({ type: 3, message: "Hello world", param: 38 }, true);
     * 
     * // Output: 
     * // > Got event 3
     * // > Event::type is 3
     * // > Event::message is Hello world
     * // > Event::param is 38
     * // > b is true
     * ```
     */
    getEvent?: (...args: any[]) => any;

    /**
     * `canContinueInvoking(arg1, arg2, ...)`. The function receives same arguments as [EventDispatcher.dispatch](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html#dispatch) and [EventQueue.enqueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html#enqueue), and must return true if the event dispatching or callback list invoking can continue, false if the dispatching should stop.
     *
     * @apply [CallbackList](https://archergu.github.io/quick-event/classes/callback_list.callbacklist.html), [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html), [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html)
     * @default the default implementation always returns true
     * @memberof QuickEventParams
     * @example ```javascript
     * // The event object we will dispatch looks like,
     * // MyEvent = {
     * //   type: int,
     * //   canceled: boolean
     * //};
     *
     * // When construct the dispatcher, pass the parameter
     * // getEvent to indicate how to get the event type.
     * // Parameter canContinueInvoking checks if the dispatching can continue.
     * let dispatcher = new EventDispatcher({
     *   getEvent: e => e.type,
     *
     *   canContinueInvoking: (e) => ! e.canceled
     * });
     *
     * dispatcher.appendListener(3, (e) => {
     *   console.log("Got event 3");
     *   e.canceled = true;
     * });
     * dispatcher.appendListener(3, (e) => {
     *   console.log("Should not get this event 3");
     * });
     *
     * // Dispatch the event.
     * // The first argument is MyEvent.
     * dispatcher.dispatch({ type: 3, canceled: false });
     * ```
     */
    canContinueInvoking?: (...args: any[]) => boolean;

    /**
     * `ArgumentPassingMode` is the argument passing mode.
     *
     * The possible values,
     *
     * ```ts
     * EventDispatcher.argumentPassingIncludeEvent = ArgumentPassingMode.IncludeEvent;
     * EventDispatcher.argumentPassingExcludeEvent = ArgumentPassingMode.ExcludeEvent;
     * ```
     *
     * The global default value,
     *
     * ```ts
     * EventDispatcher.defaultArgumentPassingMode = ArgumentPassingMode.ExcludeEvent;
     * ```
     *
     * Let's see some examples. Assume we have the dispatcher
     * ```ts
     * let dispatcher = new EventDispatcher();
     * // same as
     * let dispatcher = new EventDispatcher({ argumentPassingMode: EventDispatcher.argumentPassingExcludeEvent });
     * dispatcher.dispatch(3, "hello");
     * ```
     * The listener will be invoked with the argument `("hello")`, the event type is omitted since it's argumentPassingExcludeEvent.
     *
     * @apply [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html), [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html)
     * @default EventDispatcher.argumentPassingExcludeEvent
     * @type {ArgumentPassingMode}
     * @memberof QuickEventParams
     */
    argumentPassingMode?: ArgumentPassingMode;

    /**
     * `argumentsAsArray` affects how the listeners and `getEvent` receive the arguments.
     *
     * When `argumentsAsArray` is false, the listeners and `getEvent` receive the arguments as individual parameters. For example,
     *
     * ```javascript
     * let dispatcher = new EventDispatcher();
     * // same as
     * let dispatcher = new EventDispatcher({ argumentsAsArray: false });
     * dispatcher.dispatch(a, b, c);
     * // The listener will be called as
     * myListener(a, b, c);
     * ```
     *
     * When `argumentsAsArray` is true, the listeners and `getEvent` receive the arguments as an array of which each elements are the arguments. For example,
     *
     * ```javascript
     * let dispatcher = new EventDispatcher({ argumentsAsArray: true });
     * dispatcher.dispatch(a, b, c);
     * // The listener will be called as
     * myListener([ a, b, c ]);
     * ```
     *
     * Setting `argumentsAsArray` to true will slightly improve the performance.
     * @apply [CallbackList](https://archergu.github.io/quick-event/classes/callback_list.callbacklist.html), [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html), [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html)
     * @default false
     * @type {boolean}
     * @memberof QuickEventParams
     */
    argumentsAsArray?: boolean;

    /**
     * A mixin is used to inject code in the EventDispatcher/EventQueue inheritance hierarchy to extend the functionalities. For more details, please read the [document of mixins]().
     *
     * @apply [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html), [EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html)
     * @default undefined
     * @type {MixinFilter[]}
     * @memberof QuickEventParams
     */
    mixins?: MixinFilter[];
}

export type Callback = (...args: any[]) => any;

export type Filter = (...args: any[]) => boolean;
