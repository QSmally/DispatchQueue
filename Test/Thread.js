
const { parentPort, threadId } = require("worker_threads");
console.log(`thread ${threadId} spawned`);

parentPort.on("message", payload => {
    setTimeout(() => {
        if (payload.shouldError) throw new Error("[from thread] an error occurred");
        parentPort.postMessage({ ...payload, fromThread: threadId });
    }, 5).unref();
});
