
const ThreadInstance = require("./ThreadInstance");
const TaskQueue      = require("../Queue/TaskQueue");

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
            this.workers.push(new ThreadInstance(path, this.tasks));
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
     * Central queue of tasks.
     * @name ThreadController#tasks
     * @type {TaskQueue}
     * @readonly
     */
    tasks = new TaskQueue();

    /**
     * Whether this ThreadController has performed its
     * initialisation step to spawn all the thread instances.
     * @name ThreadController#threadsSpawned
     * @type {Boolean}
     * @readonly
     */
    threadsSpawned = false;

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
    }

    /**
     * Creates a data task.
     * @param {Object} payload Anything required by the thread implementation.
     * @returns {Promise} Promise controller wrapping the result of the task.
     * @async
     */
    async dataTask(payload) {
        if (!this.threadsSpawned) await this.instantiate();
        const idealConcurrentWorker = this.workers
            .filter(thread => !thread.currentTask && thread.isActive)[0];

        const task = {
            payload,
            ...TaskQueue.createAsyncPromise()
        };

        idealConcurrentWorker ?
            idealConcurrentWorker.dataTask(task) :
            this.tasks.schedule(task);
        return task.promise;
    }
}

module.exports = ThreadController;
