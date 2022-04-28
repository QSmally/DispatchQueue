
const Task           = require("../Thread/Task");
const ThreadInstance = require("./ThreadInstance");
const TaskQueue      = require("../Queue/TaskQueue");

class ThreadController {

    /**
     * A class which interfaces a thread queue.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {DispatchQueueInput} options A configurations object.
     */
    constructor(path, { threadAmount, lazyInitialisation, dataContext }) {
        for (let i = 0; i < threadAmount; i++) {
            const thread = new ThreadInstance(path, this.tasks, dataContext);
            this.workers.push(thread);
        }

        if (!lazyInitialisation) {
            this.instantiate();
        }
    }

    /**
     * An array of usable threads.
     * @name ThreadController#workers
     * @type {Array<ThreadInstance>}
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
     * Whether this ThreadController has performed its initialisation step to
     * spawn all the thread instances.
     * @name ThreadController#threadsSpawned
     * @type {Boolean}
     * @readonly
     */
    threadsSpawned = false;

    /**
     * Initialises all threads in this pool.
     * @returns {Promise}
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

        const task = new Task(payload);

        idlingConcurrentWorker ?
            idlingConcurrentWorker.dataTask(task) :
            this.tasks.schedule(task);
        return task.promise;
    }
}

module.exports = ThreadController;
