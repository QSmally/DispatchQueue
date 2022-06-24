
const DispatchQueue = require("../../Sources/DispatchQueue");

class Thread extends DispatchQueue.Thread {

    static automaticRejectionTime = 30;

    // TODO:
    // - Startup latency between initialisation and first task.
    // - Add payload to measure increase of communication latency.
    onPayload() {
        this.resolve({ thread: performance.now() });
    }
}

new Thread();
