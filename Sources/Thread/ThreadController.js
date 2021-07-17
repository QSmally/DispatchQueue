
const ThreadInstance = require("./ThreadInstance");

const { once } = require("events");

class ThreadController {

    /**
     * A class which interfaces a thread queue.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {Number} threadAmount Initial amount of threads.
     * @param {Boolean} deferThreadInit Whether or not to wait with spawning
     * threads until the first incoming task is registered.
     */
    constructor(path, threadAmount, deferThreadInit) {
        for (let i = 0; i < threadAmount; i++) {
            this.workers.push(new ThreadInstance(path));
        }

        if (!deferThreadInit) {
            this.instantiate();
        }
    }

    /**
     * An array of usable threads.
     * @name ThreadController#workers
     * @type {ThreadInstance}
     * @readonly
     */
    workers = [];

    /**
     * The original state of the DispatchQueue.
     * @name ThreadController#isInitialising
     * @type {Boolean}
     * @private
     */
    isInitialising = true;

    /**
     * Whether this ThreadController has performed its
     * initialisation step to spawn all the thread instances.
     * @name ThreadController#threadsSpawned
     * @type {Boolean}
     * @private
     */
    threadsSpawned = false;

    /**
     * Initialises all threads in this pool.
     * @private
     * @async
     */
    async instantiate() {
        const spawningThreads = this.workers
            .filter(W => !W.isActive)
            .map(W => once(W.spawn(), "online"));

        this.threadsSpawned = true;
        await Promise.all(spawningThreads);
        this.isInitialising = false;
    }

    /**
     * Creates a data task.
     * @param {Object} payload Anything required by the thread implementation.
     * @returns {Promise} Promise controller wrapping the result of the task.
     * @async
     */
    async dataTask(payload) {
        if (!this.threadsSpawned) await this.instantiate();
        const executionThread = this.idealWorker();
        return executionThread.dataTask(payload);
    }

    /**
     * Returns the ideal thread in terms of current performance load.
     * Keeps in mind uninitialised workers, and the overhead caused
     * by spawning the thread.
     * @returns {ThreadInstance}
     * @private
     */
    idealWorker() {
        return this.workers.reduce((ideal, comparisonThread) => {
            if (!comparisonThread.isActive && !this.isInitialising) {
                return ideal.tasks.remaining / 2 > comparisonThread.tasks.remaining ?
                    comparisonThread :
                    ideal;
            }

            return ideal.tasks.remaining > comparisonThread.tasks.remaining ?
                comparisonThread :
                ideal;
        });
    }
}

module.exports = ThreadController;
