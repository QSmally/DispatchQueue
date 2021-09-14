
class Task {
    constructor(payload) {
        /**
         * An outgoing payload to the thread.
         * @name Task#payload
         * @type {Object}
         */
        this.payload = payload;

        /**
         * A promise with outer `resolve` and `reject`
         * methods for communicating with the main thread,
         * or origin thread.
         * @name Task#promise
         * @type {Promise}
         */
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

module.exports = Task;
