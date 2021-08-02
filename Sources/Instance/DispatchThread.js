
const { isMainThread, parentPort, threadId } = require("worker_threads");

class DispatchThread {

    /**
     * A class which interfaces one individual thread.
     * @example class MyThread extends DispatchQueue.Thread { ... }
     * @implements {Worker}
     */
    constructor() {
        if (isMainThread) {
            throw new Error("DispatchThread instance can only be instantiated in a worker thread.");
        }

        this.parent.on("message", incomingPayload => {
            this.taskReplied = false;
            this.onPayload(incomingPayload);
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
     * Internal state which manages the amount of replies
     * replies this thread gives, and handles them
     * accordingly.
     * @name DispatchThread#replied
     * @type {Boolean}
     * @private
     */
    taskReplied = true;

    /**
     * Thread identifier.
     * @name DispatchThread#id
     * @type {Number}
     * @readonly
     */
    get id() {
        return threadId;
    }

    /**
     * Sends back an optional payload and marks this
     * request as finished. It is required to run this
     * function once to shift the task queue.
     * @param {Any} [payload] 
     * @returns {undefined}
     */
    resolve(payload) {
        if (this.taskReplied) {
            throw new Error("Thread already marked task as done, unable to send concurrent reply.");
        }

        this.parent.postMessage(payload);
        this.taskReplied = true;
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
