
const DispatchQueue = require("../Sources/DispatchQueue");

const DQ = new DispatchQueue("./Test/Thread.js", 3);
process.env.THREAD_DEBUG = "true";

console.log(DQ);
console.log(`[main] threads: ${DQ.threadAmount}`);
console.log(`[main] of which active: ${DQ.activeThreadAmount}`);

let iteration = 0;

const interval = setInterval(() => {
    iteration++;

    if (iteration > 100) {
        clearInterval(interval);
        console.log(DQ.threadController.workers.map(W => `thread ${W.threadId}, queue size: ${W.tasks.remaining}`));
        return;
    }

    DQ
        .task({ hello: "world", iteration, shouldError: iteration === 20 })
        .then(result => {
            console.log(result);
            if (result.iteration === 100) {
                console.log(DQ.threadController.workers.map(W => `thread ${W.threadId}, queue size: ${W.tasks.remaining}`));
            }
        })
        .catch(console.error);
}, 1);
