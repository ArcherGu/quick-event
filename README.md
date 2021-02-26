<p align="center">
    <img width="200" src="https://github.com/ArcherGu/quick-event/blob/main/logo.png" alt="logo">
</p>
<br/>
<p align="center">
    <a href="https://npmjs.com/package/quick-event">
        <img src="https://img.shields.io/npm/v/quick-event.svg?style=flat-square" alt="npm package">
    </a>
    <a href="https://github.com/ArcherGu/quick-event">
        <img src="https://img.shields.io/github/checks-status/archergu/quick-event/main?style=flat-square" alt="checks">
    </a>
    <a href="https://github.com/ArcherGu/quick-event/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/archergu/quick-event?style=flat-square" alt="license">
    </a>
</p>

# Quick Event ⚡

quick-event is a TypeScript event library that provides tools that enable your application components to communicate with each other by dispatching events and listening for them. With quick-event you can easily implement signal/slot mechanism, or observer pattern.

## Quick start

### Install

#### Install with NPM or Yarn

```bash
# npm
npm install --save quick-event
# yarn
yarn add --save quick-event
```

#### Or link to the source code directly

```html
<script src="dist/quick-event.min.js"></script>
```

Name `QuickEvent` is ready to use and no need to import.

#### Or CDN

```html
<script src="https://unpkg.com/quick-event/dist/quick-event.min.js"></script>
```

Name `QuickEvent` is ready to use and no need to import.

## How to use

### Using CallbackList

```ts
import { CallbackList } from 'quick-event';

const callbackList = new CallbackList();
callbackList.append(() => {
  console.log('Got callback 1.');
});
callbackList.append(() => {
  console.log('Got callback 2.');
});
callbackList.dispatch();
```

### Using EventDispatcher

```ts
import { EventDispatcher } from 'quick-event';

const dispatcher = new EventDispatcher();

dispatcher.appendListener(3, () => {
  console.log('Got event: 3.');
});

dispatcher.appendListener('my-event', () => {
  console.log('Got event: my-event.');
});
dispatcher.appendListener('my-event, () => {
  console.log('Got another event: my-event.');
});
dispatcher.dispatch(3);
dispatcher.dispatch('my-event');
```

### Using EventQueue

```ts
import { EventQueue } from 'quick-event';

const queue = new EventQueue();
queue.appendListener(3, (s: any, n: any) => {
  console.log(`Got event: 3, s is ${s}, n is ${n}`);
});
queue.appendListener(5, (s: any, n: any) => {
  console.log(`Got event: 5, s is ${s}, n is ${n}`);
});
queue.appendListener(5, (s: any, n: any) => {
  console.log(`Got another event: 5, s is ${s}, n is ${n}`);
});

// Enqueue the events, the first argument is always the event type.
// The listeners are not triggered during enqueue.
queue.enqueue(3, 'Hello', 38);
queue.enqueue(5, 'World', 58);

// Process the event queue, dispatch all queued events.
queue.process();
```

## Facts and features

- **Powerful**
  - Supports synchronous event dispatching and asynchronous event queue.
  - Supports event filter via mixins.
  - Configurable and extensible.
- **Robust**
  - Supports nested event. During the process of handling an event, a listener can safely dispatch event and append/prepend/insert/remove other listeners.
  - Doesn't depend on HTML DOM. eventjs works for non-browser environment.
  - Well tested. Backed by unit tests.
- **Fast**
  - Much faster than HTML DOM event listener system.
  - The EventQueue can process 5M events in 1 second (5K events per millisecond, when there are 100 event in the queue).
  - The CallbackList can invoke 1M callbacks in 1 second (1000 callbacks per millisecond).

## Documentation

[Documentation](https://archergu.github.io/quick-event/typedoc/index.html)

## Run the unit tests

```bash
yarn test
```

## Rewrite

quick-event is rewritten from [wqking/eventjs](https://github.com/wqking/eventjs).

[Wang Qi(wqking)](https://github.com/wqking) is my friend and teacher, we have developed some projects together. He's a wide-ranging, experienced developer and I've learned a lot from him.

## License

The code in this project is licensed under [MIT license](https://github.com/ArcherGu/quick-event/blob/main/LICENSE).
