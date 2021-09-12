
# DispatchQueue

> Swift's [DispatchQueue](https://developer.apple.com/documentation/dispatch/dispatchqueue) recreated in Node.


# Features
* Central dispatch queue;
* Configurable and hot-scaling of pool sizes;
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
// For a FIFO/serial queue, a thread amount of 1 can
// be configured.
const path = "./path/to/worker.js";
const threadAmount = 5;
const dispatch = new DispatchQueue(path, threadAmount);
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
// Adds or removes the delta of threads.
// In this case, it will be 3, with a total amount
// of execution threads going to be 8.
dispatch.scaleTo(8);

// Scales up or down by a given amount of threads.
// In this case, with the action above, it will be 5.
dispatch.scale(-3);

// Tip: calculate the amount of threads your program
// needs per amount of users on a scheduler. It'll act
// for 1 thread per 5000 users in this setup.
dispatch.scaleTo(Math.ceil(userAmount / 5e3));
```

## Group management
```js
// A group of dispatch queues can be created, and they
// are accessed using `.global()`.
const services = new DispatchQueue.Group({
    "main": {
        path: "./path/to/service_1/worker.js",
        threadAmount: 3 },
    "secondary": {
        path: "./path/to/service_2/worker.js",
        threadAmount: 5,
        deferInitialisation: true }
});

services
    .global("main")
    .task({ /* data */ });
    // ...
```

## Thread implementation
```js
// A file at the given thread path can use the native
// worker API Node gives, or the implementation of a
// class-based wrapper.

// *For the future*, DispatchThread handles cases such
// as pings and different thread modes automatically.
class Thread extends DispatchQueue.Thread {

    static automaticRejectionTime = 30;

    onPayload(data) {
        // ...
        this.resolve({ result, threadId: this.identifier }); // or
        throw new Error("Execution on thread failed");
    }
}

new Thread();
```


This module is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
