
class TaskQueue {

    /**
     * The property that holds all queued items.
     * @name TaskQueue#queue
     * @type {Array<Object>}
     * @readonly
     */
    queue = [];

    /**
     * Returns the amount of items remaining in the queue.
     * @name TaskQueue#remaining
     * @type {Number}
     */
    get remaining() {
        return this.queue.length;
    }

    /**
     * Adds a new task to the queue.
     * @param {Object} task A thread task.
     */
    schedule(task) {
        this.queue.push(task);
    }

    /**
     * Marks the the longest living task from the queue to be
     * processed on a thread and removes it from the queue
     * immediately.
     * @returns {Object}
     */
    pick() {
        return this.queue.shift();
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

module.exports = TaskQueue;
