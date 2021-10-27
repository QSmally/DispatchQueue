
const {
    isMainThread, parentPort, threadId, workerData
} = require("worker_threads");

class DispatchThread {

    /**
     * A duration in milliseconds which states the maximum amount of time the
     * execution of a task should take. By default, this property is
     * 'Infinity'.
     * @name DispatchThread#automaticRejectionTime
     * @type {Number}
     * @abstract
     */
    static automaticRejectionTime = Infinity;

    /**
     * A class which interfaces one individual thread.
     * @example class MyThread extends DispatchQueue.Thread { ... }
     * @implements {Worker}
     */
    constructor() {
        if (isMainThread) {
            throw new Error("DispatchThread can only be instantiated in a worker thread.");
        }

        this.parent.on("message", incomingPayload => {
            if (this.constructor.automaticRejectionTime !== Infinity) {
                this.rejectionTimeout = setTimeout(() => {
                    this.onTimeExceeded();
                }, this.constructor.automaticRejectionTime);
            }

            this.taskReplied = false;
            this.onPayload(incomingPayload);
        });

        this.onSpawn();
    }

    /**
     * The messaging port to the main thread, natively provided by Node.
     * @name DispatchThread#parent
     * @type {ParentPort}
     * @private
     */
    parent = parentPort;

    /**
     * Internal state which manages the amount of outgoing replies this thread
     * gives, and handles them accordingly elsewhere.
     * @name DispatchThread#taskReplied
     * @type {Boolean}
     * @private
     */
    taskReplied = true;

    /**
     * Internal state which manages the automatic rejection of tasks if they
     * take too long to execute.
     * @name DispatchThread#rejectionTimeout
     * @type {Timeout}
     * @private
     */
    rejectionTimeout = null;

    /**
     * Thread identifier.
     * @name DispatchThread#identifier
     * @type {Number}
     * @readonly
     */
    get identifier() {
        return threadId;
    }

    /**
     * Provided from the origin thread, additional data.
     * @name DispatchThread#dataContext
     * @type {Object}
     * @readonly
     */
    get dataContext() {
        return workerData;
    }

    /**
     * Sends back an optional payload and marks this request as finished. It is
     * required to run this function once to shift the task queue.
     * @param {Object} [payload]
     */
    resolve(payload) {
        if (this.taskReplied) {
            throw new Error("Thread already marked task as done, unable to send subsequent reply.");
        }

        this.parent.postMessage(payload);

        clearTimeout(this.rejectionTimeout);
        this.rejectionTimeout = null;
        this.taskReplied = true;
    }

    /**
     * A method that gets executed whenever this thread was initially spawned.
     * @abstract
     */
    onSpawn() {
        console.debug(`Thread ${this.identifier} spawned.`);
    }

    /**
     * Payload received from the main thread.
     * @param {Object} [payload]
     * @abstract
     */
    onPayload(_payload) {
        this.resolve();
    }

    /**
     * An abstract method which does clean-up tasks and crashes the thread when
     * a task's execution takes longer than the set maximum amount of time.
     * @throws
     * @abstract
     */
    onTimeExceeded() {
        throw new Error(`Thread took longer than ${this.constructor.automaticRejectionTime} ms to mark task as done.`);
    }
}

module.exports = DispatchThread;
