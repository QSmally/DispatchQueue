
# DispatchQueue

> Swift's [DispatchQueue](https://developer.apple.com/documentation/dispatch/dispatchqueue) recreated in Node.


# Features
* Multiple dispatch groups available;
* Configurable thread pool sizes;
* Ensuring the best processing performance.

## Installation
`npm install QSmally/DispatchQueue`
```js
const DispatchGroup = require("dispatchqueue");
// ...
```


# Usage
```js
// Group creation
const path = "path/to/worker.js";
const threadAmount = 5;
const DQ = new DispatchGroup(path, threadAmount);

// Task insertion
DQ.task({ /* data */ })
    .then(result => {
        // result completion
    })
    .catch(error => {
        // result issue
    });

// Scaling
// Adds or removes the delta of threads.
// In this case, it will be 2.
DQ.scaleTo(3);

// Scales up or down by a given amount of threads.
// In this case, with the action above, it will be 4.
QD.scale(1);
```


This module is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
