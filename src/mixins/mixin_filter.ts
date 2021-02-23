import { CallbackNode } from '../callback_node';
import { CallbackList } from '../callback_list';
import { QuickEventParams, Filter } from '../types';

/**
 * MixinFilter allows all events are filtered or modified before dispatching.
 *
 * `MixinFilter.appendFilter(filter)` adds an event filter to the dispatcher. The `filter` receives an array same as mixinBeforeDispatch receives.
 *
 * The event filters are invoked for all events, and invoked before any listeners are invoked.
 * The event filters can modify the arguments since the arguments are passed in the array.
 *
 * Event filter is a powerful and useful technology, below is some sample use cases, though the real world use cases are unlimited.
 *
 * 1, Capture and block all interested events. For example, in a GUI window system, all windows can receive mouse events. However, when a window is under mouse dragging, only the window under dragging should receive the mouse events even when the mouse is moving on other window. So when the dragging starts, the window can add a filter. The filter redirects all mouse events to the window and prevent other listeners from the mouse events, and bypass all other events.
 *
 * 2, Setup catch-all event listener. For example, in a phone book system, the system sends events based on the actions, such as adding a phone number, remove a phone number, look up a phone number, etc. A module may be only interested in special area code of a phone number, not the actions. One approach is the module can listen to all possible events (add, remove, look up), but this is very fragile -- how about a new action event is added and the module forgets to listen on it? The better approach is the module add a filter and check the area code in the filter.
 * @export
 * @class MixinFilter
 * @example ```javascript
 * let dispatcher = new EventDispatcher({
 *   mixins: [ new MixinFilter() ],
 *   argumentPassingMode: EventDispatcher.argumentPassingIncludeEvent
 * });
 *
 * dispatcher.appendListener(3, (e, i, s) => {
 *   console.log("Got event 3, i was 1 but actural is", i, "s was Hello but actural is", s);
 * });
 * dispatcher.appendListener(5, () => {
 *   console.log("Shout not got event 5");
 * });
 *
 * // Add three event filters.
 *
 * // The first filter modifies the input arguments to other values, then the subsequence filters
 * // and listeners will see the modified values.
 * dispatcher.appendFilter((args) => {
 *   console.log("Filter 1, e is", args[0], "passed in i is", args[1], "s is", args[2]);
 *   args[1] = 38;
 *   args[2] = "Hi";
 *   console.log("Filter 1, changed i is", args[1], "s is", args[2]);
 *   return true;
 * });
 *
 * // The second filter filters out all event of 5. So no listeners on event 5 can be triggered.
 * // The third filter is not invoked on event 5 also.
 * dispatcher.appendFilter((args) => {
 *   console.log("Filter 2, e is", args[0], "passed in i is", args[1], "s is", args[2]);
 *   if(args[0] === 5) {
 *     return false;
 *   }
 *   return true;
 * });
 *
 * // The third filter just prints the input arguments.
 * dispatcher.appendFilter((args) => {
 *   console.log("Filter 3, e is", args[0], "passed in i is", args[1], "s is", args[2]);
 *   return true;
 * });
 *
 * // Dispatch the events, the first argument is always the event type.
 * dispatcher.dispatch(3, 1, "Hello");
 * dispatcher.dispatch(5, 2, "World");
 * 
 * // Output
 * // > Filter 1, e is 3 passed in i is 1 s is Hello
 * // > Filter 1, changed i is 38 s is Hi
 * // > Filter 2, e is 3 passed in i is 38 s is Hi
 * // > Filter 3, e is 3 passed in i is 38 s is Hi
 * // > Got event 3, i was 1 but actural is 38 s was Hello but actural is Hi
 * // > Filter 1, e is 5 passed in i is 2 s is World
 * // > Filter 1, changed i is 38 s is Hi
 * // > Filter 2, e is 5 passed in i is 38 s is Hi
 * ```
 */
export class MixinFilter {
    public filterList: CallbackList;
    constructor(params?: QuickEventParams) {
        this.filterList = new CallbackList(params);
    }

    /**
     * Add the *filter* to the dispatcher.<br/>
     * Return a handle which can be used in removeFilter.
     *
     * @param {Filter} filter
     * @returns {CallbackNode}
     * @memberof MixinFilter
     */
    public appendFilter(filter: Filter): CallbackNode {
        return this.filterList.append(filter);
    }

    /**
     * Remove a filter from the dispatcher.<br/>
     * `filter` can be either the filter callback or the handle returned by `appendFilter`.<br/>
     * Return true if the filter is removed successfully.
     *
     * @param {(Filter | CallbackNode)} handle
     * @returns {boolean}
     * @memberof MixinFilter
     */
    public removeFilter(handle: Filter | CallbackNode): boolean {
        return this.filterList.remove(handle);
    }

    public mixinBeforeDispatch(args: any[]): boolean {
        if (!this.filterList.empty()) {
            if (!this.filterList.forEachIf((callback) => {
                return callback.call(callback, args);
            })) {
                return false;
            }
        }

        return true;
    }
}
