
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
            throw new TypeError("Amount of threads being spawned cannot be negative.");
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

    get threadAmount() {
        return this.threadController.workers
            .filter(W => W.isActive)
            .length;
    }

    // TODO:
    // Initiate data tasks.
    task(data) {}
}

module.exports = DispatchQueue;
