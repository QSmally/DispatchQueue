
const ThreadInstance   = require("./Thread/ThreadInstance");
const ThreadController = require("./Thread/ThreadController");

const { cpus } = require("os");

class DispatchQueue {

    static Group = require("./Group");
    static Thread = require("./Instance/DispatchThread");

    /**
     * @typedef {Object} DispatchQueueInput
     * @property {Number} threadAmount Initial amount of threads this queue
     * should spawn. It defaults to the value returned by `os.cpus().length`.
     * @property {Boolean} lazyInitialisation Whether or not to wait with
     * spawning threads until the first task is created. By default, this is
     * disabled.
     * @property {Object} dataContext Any data to provide to the thread.
     */

    /**
     * The main interface for interacting with one DispatchQueue instance.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {DispatchQueueInput} [optionals] Additional configuration with
     * properties like `threadAmount`, `lazyInitialisation` and `dataContext`.
     */
    constructor(path, {
        threadAmount = cpus().length,
        lazyInitialisation = false,
        dataContext = {}
    } = {}) {
        /**
         * A path to a DispatchThread implementation.
         * @name DispatchQueue#path
         * @type {Pathlike}
         * @readonly
         */
        this.path = path;

        /**
         * Additional data to provide the thread.
         * @name DispatchQueue#dataContext
         * @type {Object}
         * @readonly
         */
        this.dataContext = dataContext;

        if (isNaN(threadAmount)) {
            throw new TypeError(`Thread amount should be an unsigned integer, not "${typeof threadAmount}".`);
        }

        if (threadAmount < 1) {
            throw new TypeError("Amount of threads being spawned cannot be zero or negative.");
        }

        /**
         * DispatchQueue's thread controller.
         * @name DispatchQueue#threadController
         * @type {ThreadController}
         * @private
         */
        this.threadController = new ThreadController(path, {
            threadAmount,
            lazyInitialisation,
            dataContext });
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
            .filter(worker => worker.isActive)
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

    /**
     * Scales this DispatchQueue to the given amount of threads.
     * @param {Number} absoluteThreadAmount Unsigned amount of total threads.
     * @returns {Number}
     */
    scaleTo(absoluteThreadAmount) {
        const delta = absoluteThreadAmount - this.threadAmount;
        return this.scale(delta);
    }

    /**
     * Scales the size of this DispatchQueue.
     * @param {Number} deltaThreadAmount Signed amount of threads to change
     * this DispatchQueue's total thread amount with.
     * @returns {Number}
     */
    scale(deltaThreadAmount) {
        if (this.threadAmount + deltaThreadAmount < 1) {
            throw new TypeError("Resultant amount of threads cannot be zero or negative.");
        }

        if (deltaThreadAmount > 0) {
            for (let i = 0; i < deltaThreadAmount; i++) {
                const newThread = new ThreadInstance(
                    this.path,
                    this.threadController.tasks,
                    this.dataContext);
                newThread.spawn();
                this.threadController.workers.push(newThread);
            }
        } else {
            this.threadController.workers
                .splice(0, Math.abs(deltaThreadAmount))
                .forEach(worker => worker.willQuit = true);
        }

        return this.threadAmount;
    }
}

module.exports = DispatchQueue;
