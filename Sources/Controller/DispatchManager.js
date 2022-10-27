
const TaskQueue        = require("./TaskQueue");
const ThreadController = require("./ThreadController");

class DispatchManager {

    /**
     * A class which interfaces a thread queue.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {DispatchQueueInput} options A configurations object.
     */
    constructor(path, { threadAmount, lazyInitialisation, dataContext }) {
        for (let i = 0; i < threadAmount; i++) {
            const thread = new ThreadController(path, this.tasks, dataContext);
            this.workers.push(thread);
        }

        if (!lazyInitialisation) {
            this.instantiate();
        }
    }

    /**
     * An array of usable threads.
     * @name DispatchManager#workers
     * @type {Array<ThreadController>}
     * @readonly
     */
    workers = [];

    /**
     * Central queue of tasks.
     * @name DispatchManager#tasks
     * @type {TaskQueue}
     * @readonly
     */
    tasks = new TaskQueue();

    /**
     * Whether this DispatchManager has performed its initialisation step to
     * spawn all the thread instances.
     * @name DispatchManager#threadsSpawned
     * @type {Boolean}
     * @readonly
     */
    threadsSpawned = false;

    /**
     * Initialises all threads in this pool.
     * @private
     */
    instantiate() {
        this.workers
            .filter(thread => !thread.isActive)
            .forEach(thread => thread.spawn());
        this.threadsSpawned = true;
    }

    /**
     * Creates a data task.
     * @param {Object} payload Anything required by the thread implementation.
     * @returns {Promise} A new task promise.
     */
    dataTask(payload) {
        if (!this.threadsSpawned) this.instantiate();
        const idlingConcurrentWorker = this.workers
            .find(thread => !thread.currentTask && thread.isActive);

        const task = new TaskQueue.Task(payload);

        idlingConcurrentWorker ?
            idlingConcurrentWorker.dataTask(task) :
            this.tasks.schedule(task);
        return task.promise;
    }
}

module.exports = DispatchManager;
