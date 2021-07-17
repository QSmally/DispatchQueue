
class ThreadQueue {
    /**
     * The property that holds all queued items.
     * @name ThreadQueue#queue
     * @type {Array<Object>}
     * @readonly
     */
    queue = [];

    /**
     * Returns the amount of items remaining in the queue.
     * @name ThreadQueue#remaining
     * @type {Number}
     */
    get remaining() {
        return this.queue.length;
    }

    /**
     * Generates a promise that gets resolved once the queued
     * task is returned from the thread.
     * @returns {Promise}
     */
    wait() {
        const nextQueuedItem = this.queue.length ?
            this.queue[this.queue.length - 1].promise :
            Promise.resolve();

        const promise = ThreadQueue.createAsyncPromise();
        this.queue.push(promise);

        return nextQueuedItem;
    }

    /**
     * Marks the item in the queue as resolved and unlocks
     * the queue for the next task.
     * @returns {undefined}
     */
    nextTask() {
        this.queue.shift()?.resolve();
    }

    /**
     * Returns an object with outer `resolve` and `reject`
     * methods, along with the promise itself.
     * @returns {Object}
     * @static
     */
    static createAsyncPromise() {
        let resolveTask = null;
        let rejectTask = null;

        const promise = new Promise((resolve, reject) => {
            resolveTask = resolve;
            rejectTask = reject;
        });

        return {
            promise,
            resolve: resolveTask,
            reject: rejectTask
        };
    }
}

module.exports = ThreadQueue;
