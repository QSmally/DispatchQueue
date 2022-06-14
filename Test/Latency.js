
const DispatchQueue = require("../Sources/DispatchQueue");

const threads = 30;
const tasks = 500;

function latencyTest(threadAmount) {
    return new Promise(resolve => {
        const queue = new DispatchQueue("./Test/Thread.js", {
            threadAmount,
            logs: false });

        setTimeout(async () => {
            const startTime = performance.now();
            const runningTasks = [];

            for (let i = 0; i < tasks; i++) {
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
    for (let threadAmount = 1; threadAmount < threads; threadAmount++) {
        const result = await latencyTest(threadAmount);
        console.log(`${threadAmount} threads, ${tasks} tasks: ${Math.round(result * 1e3) / 1e3} ms`);
    }

    process.exit(0);
})();
