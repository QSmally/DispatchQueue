
class Task {

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

module.exports = Task;
