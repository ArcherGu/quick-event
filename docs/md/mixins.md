# Mixins

## Introduction

A mixin is used to inject code in the [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html)/[EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html) to extend the functionalities. In this document we will use [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html) as the example, the usage for EventQueue is exactly the same.  
All methods and properties in the mixin are copied to the [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html)/[EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html) and can be used as if they are part of the [EventDispatcher](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html)/[EventQueue](https://archergu.github.io/quick-event/classes/event_queue.eventqueue.html).

## Define a mixin

A mixin is a class, or to say, a function object.  
A typical mixin should look like,

```ts
class MyMixin {
  public propA: number = 1;
  public propB: number = 5;
}
```

## Inject(enable) mixins to EventDispatcher

To enable mixins, add them to the `mixins` property in the parameters object. For example, to enable `MixinFilter`, create the dispatcher as,

```ts
const dispatcher = new EventDispatcher({
  mixins: [new MixinFilter()],
});
```

If there are multiple mixins, add them to mixins array.

## Optional interceptor points

A mixin can have special named functions that are called at certain point.  
Currently there is only one special function,

```ts
public mixinBeforeDispatch(...args: any[]): boolean;
```

`mixinBeforeDispatch` is called before any event is dispatched in both EventDispatcher and EventQueue. It receives an array that contains the arguments passed to [EventDispatcher.dispatch](https://archergu.github.io/quick-event/classes/event_dispatcher.eventdispatcher.html#dispatch). So the function can modify the arguments in the array, then the listeners will see the modified values.  
The function returns `true` to continue the dispatch, `false` will stop any further dispatching.  
For multiple mixins, this function is called in the order of they appearing in `mixins` in the parameters object.
