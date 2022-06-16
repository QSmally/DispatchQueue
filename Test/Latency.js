
const DispatchQueue = require("../Sources/DispatchQueue");

const kThreads = 30;
const kTasks = 500;

function latencyTest(threadAmount) {
    return new Promise(resolve => {
        const queue = new DispatchQueue("./Test/Thread.js", {
            threadAmount,
            logs: false });

        setTimeout(async () => {
            const startTime = performance.now();
            const runningTasks = [];

            for (let i = 0; i < kTasks; i++) {
                const task = queue.task({
                    hello: "world",
                    iteration: i });
                runningTasks.push(task);
            }

            await Promise.allSettled(runningTasks);
            const endTime = performance.now();
            resolve(endTime - startTime);
        }, 500);
    });
}

(async () => {
    for (let threadAmount = 0; threadAmount < kThreads; threadAmount++) {
        const threads = threadAmount + 1;
        const result = await latencyTest(threads);
        console.log(`${threads} threads, ${kTasks} tasks: ${Math.round(result * 1e3) / 1e3} ms`);
    }

    process.exit(0);
})();
