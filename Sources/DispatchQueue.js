
const ThreadController = require("./Thread/ThreadController");

const { cpus } = require("os");

class DispatchQueue {

    /**
     * The main interface for interacting with one DispatchQueue instance.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {Number} [threadAmount] Initial amount of threads this queue
     * should spawn. It defaults to the value returned by `os.cpus().length`.
     */
    constructor(path, threadAmount = cpus().length) {
        /**
         * A path to the thread implementation.
         * @name DispatchQueue#path
         * @type {Pathlike}
         * @readonly
         */
        Object.defineProperty(this, "path", {
            enumerable: true,
            writable: false,
            value: path
        });

        if (isNaN(threadAmount)) {
            throw new TypeError(`Thread amount should be an unsigned integer, not "${threadAmount}".`);
        }

        if (threadAmount <= 0) {
            throw new TypeError("Amount of threads being spawned cannot be zero or negative.");
        }

        /**
         * DispatchQueue's thread controller.
         * @name DispatchQueue#threadController
         * @type {ThreadController}
         * @private
         */
        Object.defineProperty(this, "threadController", {
            enumerable: false,
            writable: false,
            value: new ThreadController(path, threadAmount)
        });
    }

    /**
     * Returns the amount of threads currently inside of this pool.
     * @name DispatchQueue#threadAmount
     * @type {Number}
     */
    get threadAmount() {
        return this.threadController.workers.length;
    }

    /**
     * Returns the amount of all initialised and active threads of this pool.
     * @name DispatchQueue#activeThreadAmount
     * @type {Number}
     */
    get activeThreadAmount() {
        return this.threadController.workers
            .filter(W => W.isActive)
            .length;
    }

    /**
     * Creates a data task.
     * @param {Object} payload Anything required by the thread implementation.
     * @returns {Promise} Promise controller wrapping the result of the task.
     */
    task(payload) {
        return this.threadController.dataTask(payload);
    }
}

module.exports = DispatchQueue;
