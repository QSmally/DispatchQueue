
const DispatchManager  = require("./Controller/DispatchManager");
const ThreadController = require("./Controller/ThreadController");

const { cpus } = require("os");

class DispatchQueue {

    static Group = require("./DispatchGroup");
    static Thread = require("./Driver/DispatchThread");

    /**
     * Any path representable as a string.
     * @typedef {String} Pathlike
     */

    // TODO: 'DispatchQueueConfiguration' and 'DispatchQueueGroupConfiguration'
    /**
     * @typedef {Object} DispatchQueueInput
     * @property {Number} threadAmount Initial amount of threads this queue should spawn. It defaults to the value returned by `os.cpus().length`.
     * @property {Boolean} lazyInitialisation Whether or not to wait with spawning threads until the first task is created. By default, this is disabled.
     * @property {Object} dataContext Any data to provide to the thread.
     * @property {Boolean} logs Logs for debugging thread behaviour. By default, this is disabled.
     */

    /**
     * The main interface for interacting with one DispatchQueue instance.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {DispatchQueueInput} [optionals] Additional configuration with properties like `threadAmount`, `lazyInitialisation` and `dataContext`.
     */
    constructor(path, {
        threadAmount = cpus().length,
        lazyInitialisation = false,
        dataContext = {},
        logs = false
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
        this.dataContext = { ...dataContext, logs };

        if (isNaN(threadAmount)) {
            throw new TypeError(`Thread amount should be an unsigned integer, not "${typeof threadAmount}".`);
        }

        if (threadAmount < 1) {
            throw new TypeError("Amount of threads being spawned cannot be zero or negative.");
        }

        /**
         * An object which manages the lifetime of all the threads of this
         * DispatchQueue.
         * @name DispatchQueue#manager
         * @type {DispatchManager}
         * @private
         */
        this.manager = new DispatchManager(path, {
            threadAmount,
            lazyInitialisation,
            dataContext: this.dataContext });
    }

    /**
     * Returns the amount of threads currently inside of this pool.
     * @name DispatchQueue#threadAmount
     * @type {Number}
     */
    get threadAmount() {
        return this.manager.workers.length;
    }

    /**
     * Returns the amount of all initialised and active threads of this pool.
     * @name DispatchQueue#activeThreadAmount
     * @type {Number}
     */
    get activeThreadAmount() {
        return this.manager.workers
            .filter(worker => worker.isActive)
            .length;
    }

    /**
     * Creates a data task.
     * @param {Object} payload Anything required by the thread implementation.
     * @returns {Promise} Promise controller wrapping the result of the task.
     */
    task(payload) {
        return this.manager.dataTask(payload);
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
     * Scales the amount of execution threads of this DispatchQueue.
     * @param {Number} deltaThreadAmount Signed amount of threads to change this DispatchQueue's total thread amount with.
     * @returns {Number}
     */
    scale(deltaThreadAmount) {
        if (this.threadAmount + deltaThreadAmount < 1) {
            throw new TypeError("Resultant amount of threads cannot be zero or negative.");
        }

        if (deltaThreadAmount > 0) {
            for (let i = 0; i < deltaThreadAmount; i++) {
                const newThread = new ThreadController(
                    this.path,
                    this.manager.tasks,
                    this.dataContext);

                if (this.manager.threadsSpawned) newThread.spawn();
                this.manager.workers.push(newThread);
            }
        } else {
            this.manager.workers
                .splice(0, Math.abs(deltaThreadAmount))
                .forEach(worker => worker.quit());
        }

        return this.threadAmount;
    }
}

module.exports = DispatchQueue;
