
class TaskQueue {

    static Task = class Task {

        /**
         * Internal typed structure which represents one particular data task.
         * @param {Object} payload An outgoing payload.
         */
        constructor(payload) {
            /**
             * An outgoing payload to the thread.
             * @name Task#payload
             * @type {Object}
             * @readonly
             */
            this.payload = payload;
        }

        /**
         * A promise with outer `resolve` and `reject` methods which communicate
         * the task's execution result with the origin thread.
         * @name Task#promise
         * @type {Promise}
         * @readonly
         */
        promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    /**
     * The property that holds all queued items.
     * @name TaskQueue#queue
     * @type {Array<Task>}
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
     * @param {Task} task A thread task.
     */
    schedule(task) {
        this.queue.push(task);
    }

    /**
     * Marks the the longest living task from the queue to be processed on a
     * thread and removes it from the queue immediately.
     * @returns {Task?}
     */
    pick() {
        return this.queue.shift();
    }
}

module.exports = TaskQueue;
