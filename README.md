
# DispatchQueue

> Swift's [DispatchQueue](https://developer.apple.com/documentation/dispatch/dispatchqueue) recreated in ECMAScript/Node.


# Features
* Central dispatch queue;
* Configurable and hot-scaling of amount of threads;
* Automatic restart of failed workers;
* DispatchGroups;
* A thread implementation, DispatchThread;
* Terminate tasks which take longer than x ms.

## Installation
`npm install dispatchqueue`
```js
const DispatchQueue = require("dispatchqueue");
// ...
```


# Usage
```js
// A thread amount of 1 can be configured for a FIFO/serial queue.
const path = "./path/to/worker.js";
const threadAmount = 5;
const dispatch = new DispatchQueue(path, { threadAmount });
```

## Task creation
```js
// Schedules a task to the queue.
dispatch
    .task({ /* data */ })
    .then(result => { /* result completion */ })
    .catch(error => { /* result issue */ });
```

## Scaling
```js
// Scales to a given amount of absolute threads.
// A total amount of execution threads is going to be 8.
dispatch.scaleTo(8);

// Scales up or down by a given amount of threads.
// In this case, with the action above, it will be 5 total threads.
dispatch.scale(-3);

// Tip: calculate the amount of threads your application needs per
// amount of users on a scheduler. It'll spawn one thread for each
// 5000 users, for example.
dispatch.scaleTo(Math.ceil(userAmount / 5e3));
```

## Group management
```js
// A group of dispatch queues can be created, and they are accessed
// using `.global()`.
const services = new DispatchQueue.Group({
    "main": {
        path: "./path/to/service_1/worker.js",
        threadAmount: 3,
        dataContext: { ... } },
    "secondary": {
        path: "./path/to/service_2/worker.js",
        threadAmount: 5,
        lazyInitialisation: true }
});

services
    .global("main")
    .task({ /* data */ });
    // ...
```

## Thread implementation
```js
// A file at the thread path can use DispatchThread, which
// automatically ensures payload safety and other synchronisation.
class Thread extends DispatchQueue.Thread {

    static automaticRejectionTime = 30;

    onPayload(data) {
        const result = {
            ...data,
            context: this.dataContext,
            threadId: this.identifier };
        this.resolve(result); // or
        throw new Error("Task failed to execute");
    }
}

new Thread();
```


This module is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
