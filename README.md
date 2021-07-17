
# DispatchQueue

> Swift's [DispatchQueue](https://developer.apple.com/documentation/dispatch/dispatchqueue) recreated in Node.


# Features
* Multiple dispatch groups available;
* Configurable thread pool sizes;
* Ensuring the best processing performance.

## Installation
`npm install dispatchqueue`
```js
const DispatchQueue = require("dispatchqueue");
// ...
```


# Usage
```js
const path = "./path/to/worker.js";
const threadAmount = 5;
const DQ = new DispatchQueue(path, threadAmount);
```

## Task creation
```js
// Schedules a task and finds the ideal thread to
// perform it on.
DQ
    .task({ /* data */ })
    .then(result => { /* result completion */ })
    .catch(error => { /* result issue */ });
```

## Scaling (planned feature)
```js
// Adds or removes the delta of threads.
// In this case, it will be -2, with a total amount
// of threads being 3.
DQ.scaleTo(3);

// Scales up or down by a given amount of threads.
// In this case, with the action above, it will be 4.
DQ.scale(1);
```

## Group management (planned feature)
```js
// A group of dispatch queues can be created, and they
// are accessed using `.global()`.
const services = new DispatchQueue.Group({
    "service_1": { path: "./path/to/service_1/worker.js", threadAmount: 3 },
    "service_2": { path: "./path/to/service_2/worker.js", threadAmount: 5 },
    "service_3": { path: "./path/to/service_3/worker.js", threadAmount: 4 }
});

services
    .global("service_3")
    .task({ /* data */ });
    // ...
```

## Thread implementation (planned feature)
```js
// A file at the given thread path can use the native
// worker API Node gives, or the implementation of a
// class-based wrapper.
// DispatchThread handles cases such as pings automatically.
class Thread extends DispatchQueue.Thread {
    onPayload(data) {
        // ...
        this.resolve(result); // or
        throw new Error("Execution failed");
    }
}

new Thread();
```


This module is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
