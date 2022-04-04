
const DispatchQueue = require("../Sources/DispatchQueue");

const dataContext = { hello: "from context" };

const queue = new DispatchQueue("./Test/Thread.js", {
    threadAmount: 4,
    dataContext });
console.assert(
    queue.threadAmount === 4,
    "Dispatch must have 4 threads");
console.assert(
    queue.activeThreadAmount === 0,
    "Dispatch must have 4 offline threads (just spawned)");

// Comparable results
const kErrorKey = 40;
const kTimeoutKey = 41;
const kCompleteTimeout = 300;

const sourceCompareTasks = Array.from(Array(99), (_, index) => {
    const key = index + 1;
    if (![kErrorKey, kTimeoutKey].includes(key)) return key;
})
    .filter(iteration => !!iteration);

// Generated from tests
let iteration = 0;
const finishedTasks = [];

// Generic methods
function logThreads() {
    const workerStates = queue.threadController.workers
        .map(thread => `Thread ${thread.threadId}, is active: ${thread.isActive}`);
    console.log(workerStates);
}

function completed() {
    setTimeout(() => {
        console.assert(
            queue.threadController.tasks.remaining === 0,
            `Queue not drained, ${queue.threadController.tasks.remaining} remaining`);
        console.log(`Queue has been drained (${queue.threadController.tasks.remaining} remaining), all tasks completed`);

        const difference = sourceCompareTasks.filter(task => !finishedTasks.includes(task));
        console.assert(!difference.length, `Failed to mark tasks ${difference} as done`);
        process.exit(0);
    }, kCompleteTimeout);
}

// Schedule a task every 1 ms
const interval = setInterval(() => {
    iteration++;

    if (iteration === 100) {
        console.log(`Synchronous tasks are inserted into queue (${queue.threadController.tasks.remaining} remaining)`);
        return clearInterval(interval);
    }

    if (iteration === 30) {
        console.log("Threads scaling up to 6 (+2)");
        queue.scaleTo(6);
        logThreads();
    }

    if (iteration === 75) {
        console.log("Threads scaling down to 5 (-1)");
        queue.scale(-1);
        logThreads();
    }

    const payload = {
        hello: "world!",
        iteration,
        doError: iteration === kErrorKey,
        doTimeout: iteration === kTimeoutKey
    };

    queue
        .task(payload)
        .then(taskResultPayload => {
            console.log(taskResultPayload);
            finishedTasks.push(taskResultPayload.iteration);
            if (payload.iteration === 99) completed(taskResultPayload);
        })
        .catch(console.error);
}, 1);
