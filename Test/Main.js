
const DispatchQueue = require("../Sources/DispatchQueue");

const DQ = new DispatchQueue("./Test/Thread.js", 4);

console.log(DQ);
console.log(`[main] threads: ${DQ.threadAmount}`);
console.log(`[main] of which active: ${DQ.activeThreadAmount}`);

let iteration = 0;

const tests = new Map();

const interval = setInterval(() => {
    iteration++;

    if (iteration > 100) {
        clearInterval(interval);
        console.log("sync iterations are done");
        console.log(DQ.threadController.workers.map(W => `thread ${W.threadId}, queue size: ${W.tasks.remaining}`));
        return;
    }

    tests.set(iteration, false);

    if (iteration === 30) {
        console.log("scaling to 6 threads");
        DQ.scaleTo(6);
    }

    if (iteration === 75) {
        console.log("scaling down to 5 threads");
        DQ.scale(-1);
    }

    DQ
        .task({ hello: "world", iteration, shouldError: iteration === 40 })
        .then(result => {
            console.log(result);
            tests.set(result.iteration, true);

            if (result.iteration === 100) {
                setTimeout(() => {
                    console.log("async tasks are completed");
                    console.log(DQ.threadController.workers.map(W => `thread ${W.threadId}, queue size: ${W.tasks.remaining}`));
                    console.log("expect 40 to fail, because test error causing thread exit");
                    console.log([...tests.entries()].filter(R => R[1] === false));

                    let newIteration = 0;

                    const newInterval = setInterval(() => {
                        DQ.task({ hello: "again", iteration: "exit test" })
                            .then(console.log)
                            .catch(console.error);
                        newIteration++;

                        if (newIteration === 20) {
                            console.log("scaling to 1 thread");
                            DQ.scaleTo(1);
                        }

                        if (newIteration === 40) {
                            clearInterval(newInterval);
                            console.assert(DQ.activeThreadAmount === 1, "if you're seeing this, workers could not scale down to 1");
                        }
                    }, 1);
                }, 100);
            }
        })
        .catch(console.error);
}, 1);
