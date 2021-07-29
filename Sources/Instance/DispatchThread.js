
const { parentPort } = require("worker_threads");

class DispatchThread {
    constructor() {
        this.parent.on("message", payload => {
            this.replied = false;
            this.onPayload(payload);
        });

        this.onSpawn();
    }

    /**
     * The messaging port to the main thread, natively
     * interfaced by Node.
     * @name DispatchThread#parent
     * @type {ParentPort}
     * @readonly
     */
    parent = parentPort;

    /**
     * 
     * @name DispatchThread#replied
     * @type {Boolean}
     * @private
     */
    replied = false;

    /**
     * Sends back an optional payload and marks this
     * request as finished. It is required to run this
     * function once to shift the task queue.
     * @param {Any} [payload] 
     * @returns {undefined}
     */
    resolve(payload) {
        if (this.replied) {
            throw new Error("Thread already marked task as done, unable to send concurrent reply.");
        }

        this.parent.postMessage(payload);
        this.replied = true;
    }

    /**
     * A method that gets executed whenever this thread
     * was initially spawned.
     * @abstract
     */
    onSpawn() {}

    /**
     * Payload received from the main thread.
     * @param {Any} [payload] 
     * @returns {Any}
     * @abstract
     */
    onPayload(_payload) {
        this.resolve();
    }
}

module.exports = DispatchThread;
