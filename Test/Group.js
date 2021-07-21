
const DispatchQueue = require("../Sources/DispatchQueue");

const DG = new DispatchQueue.Group({
    "service_1": { path: "./Test/Thread.js", threadAmount: 1, deferThreadInit: true },
    "service_2": { path: "./Test/Thread.js", threadAmount: 2 }
});

console.log(DG);
console.log(`[main] groups: ${DG.threadGroups.size}`);
console.log(`[main] total threads: ${[...DG.threadGroups.values()].flatMap(instance => instance.threadAmount).reduce((a, c) => a + c)}`);

let iteration = 0;

const tests = new Map();

const interval = setInterval(() => {
    iteration++;

    if (iteration > 10) {
        clearInterval(interval);
        console.log("sync iterations are done");
        console.log(DG.global("service_2").threadController.workers.map(W => `thread ${W.threadId}, queue size: ${W.tasks.remaining}`));
        return;
    }

    tests.set(iteration, false);

    if (iteration === 5) {
        setTimeout(() => {
            DG
                .global("service_1")
                .task({ hello: "there", from: "service_1", iteration: 5 })
                .then(console.log)
                .catch(console.error);
        }, 10);
        return;
    }

    DG
        .global("service_2")
        .task({ hello: "world", from: "service_2", iteration })
        .then(result => {
            console.log(result);
            tests.set(result.iteration, true);

            if (result.iteration === 10) {
                setTimeout(() => {
                    console.log("async tasks are completed");
                    console.log(DG.global("service_2").threadController.workers.map(W => `thread ${W.threadId}, queue size: ${W.tasks.remaining}`));
                }, 100);
            }
        })
        .catch(console.error);
}, 1);
