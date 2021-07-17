
const { parentPort } = require("worker_threads");

parentPort.on("message", payload => {
    setTimeout(() => {
        if (payload.shouldError) throw new Error("[from thread] an error occurred");
        parentPort.postMessage({ ...payload, fromThread: true });
    }, 5).unref();
});
