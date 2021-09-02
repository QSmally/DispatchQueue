
const ThreadInstance = require("./ThreadInstance");

const { once } = require("events");

class ThreadController {

    /**
     * A class which interfaces a thread queue.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {Number} threadAmount Initial amount of threads.
     * @param {Boolean} deferInitialisation Whether or not to wait with
     * spawning threads until the first incoming task is registered.
     */
    constructor(path, threadAmount, deferInitialisation) {
        for (let i = 0; i < threadAmount; i++) {
            this.workers.push(new ThreadInstance(path));
        }

        if (!deferInitialisation) {
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
     * Whether this ThreadController has performed its
     * initialisation step to spawn all the thread instances.
     * @name ThreadController#threadsSpawned
     * @type {Boolean}
     * @readonly
     */
    threadsSpawned = false;

    /**
     * If the threads of this DispatchQueue are not or still
     * being initialised.
     * @name ThreadController#isStillInitialising
     * @type {Boolean}
     * @readonly
     */
    isStillInitialising = true;

    /**
     * Initialises all threads in this pool.
     * @private
     * @async
     */
    async instantiate() {
        const spawningThreads = this.workers
            .filter(thread => !thread.isActive)
            .map(thread => once(thread.spawn(), "online"));

        this.threadsSpawned = true;
        await Promise.all(spawningThreads);
        this.isStillInitialising = false;
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
        return this.workers.reduce((idealThread, comparisonThread) => {
            const overhead = !comparisonThread.isActive && !this.isStillInitialising ?
                2 : 1;

            return idealThread.tasks.remaining / overhead > comparisonThread.tasks.remaining ?
                comparisonThread :
                idealThread;
        });
    }
}

module.exports = ThreadController;
