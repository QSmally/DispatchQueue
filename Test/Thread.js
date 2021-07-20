
const { parentPort, threadId } = require("worker_threads");
console.log(`thread ${threadId} spawned`);

parentPort.on("message", payload => {
    setTimeout(() => {
        if (payload.shouldError) throw new Error(`[from thread ${threadId}] thrown error to see a thread restart`);
        parentPort.postMessage({ ...payload, fromThread: threadId });
    }, 5).unref();
});
