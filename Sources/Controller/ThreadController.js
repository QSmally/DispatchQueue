
const { Worker } = require("worker_threads");

class ThreadController {

    /**
     * A representative class which delegates one particular worker thread.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {TaskQueue} taskQueue Reference to the central task queue.
     * @param {Object} dataContext Additional data to provide the thread.
     */
    constructor(path, taskQueue, dataContext) {
        /**
         * A path to the thread implementation.
         * @name ThreadController#path
         * @type {Pathlike}
         * @readonly
         */
        this.path = path;

        /**
         * Queued data tasks.
         * @name ThreadController#tasks
         * @type {TaskQueue}
         * @readonly
         */
        this.tasks = taskQueue;

        /**
         * Additional data to provide the thread.
         * @name ThreadController#dataContext
         * @type {Object}
         * @readonly
         */
        this.dataContext = dataContext;
    }

    /**
     * Whether this ThreadController has a thread already active.
     * @name ThreadController#isActive
     * @type {Boolean}
     * @readonly
     */
    isActive = false;

    /**
     * Indicator when this thread is scheduled to quit. The thread instance
     * will eventually exit when it's done with its currently executing task.
     * @name ThreadController#willQuit
     * @type {Boolean}
     * @readonly
     */
    willQuit = false;

    /**
     * Native thread interface by Node.
     * @name ThreadController#worker
     * @type {Worker?}
     * @readonly
     */
    worker = null;

    /**
     * Thread identifier when spawned.
     * @name ThreadController#threadId
     * @type {Number?}
     * @readonly
     */
    threadId = null;

    /**
     * Timestamp when this thread was last (re)spawned.
     * @name ThreadController#lastSpawnedAt
     * @type {Number?}
     * @readonly
     */
    lastSpawnedAt = null;

    /**
     * The currently executing data task.
     * @name ThreadController#currentTask
     * @type {Task?}
     * @readonly
     */
    currentTask = null;

    /**
     * Spawns a thread and caches its unique thread identifier. When the worker
     * is active, it marks it as usable.
     * @returns {Worker}
     */
    spawn() {
        this.worker = new Worker(this.path, { workerData: this.dataContext })
            .once("exit", code => this.terminate(code))
            .once("online", () => this.onSpawn())
            .on("message", payload => this.onPayload(payload))
            .on("error", error => this.onErrorPayload(error));

        this.threadId = this.worker.threadId;
        this.lastSpawnedAt = Date.now();
        return this.worker;
    }

    /**
     * Indicates that this thread will quit in the near future. If possible, it
     * immediately terminates the worker, only if there isn't any current task
     * being executed.
     */
    quit() {
        this.willQuit = true;
        if (!this.currentTask) this.terminate();
    }

    /**
     * Terminates the internal thread. If the exit code was non-zero, the
     * thread will get restored.
     * @param {Number} exitCode A thread exit code.
     * @returns {Promise}
     * @async
     */
    async terminate(exitCode = 0) {
        if (this.dataContext.logs) {
            const message = `Thread ${this.threadId} terminated`;
            console.debug(exitCode !== 0 ?
                `${message} with exit code ${exitCode}` :
                message);
        }

        this.isActive = false;
        this.worker?.removeAllListeners();
        await this.worker?.terminate();

        this.worker = null;
        this.threadId = null;

        if (!this.willQuit && exitCode !== 0) {
            this.spawn();
        }
    }

    /**
     * Applies a task for this thread.
     * @param {Task} task A thread task.
     */
    async dataTask(task) {
        this.currentTask = task;
        this.worker.postMessage(task.payload);
    }

    /**
     * Registers this thread as online and fetches a new task from the queue.
     * @private
     */
    onSpawn() {
        this.isActive = true;
        const fetchedTask = this.tasks.pick();
        if (fetchedTask) this.dataTask(fetchedTask);
    }

    /**
     * An event which is performed whenever a response from the thread is
     * received.
     * @param {Object} [payload] The thread's response payload.
     * @private
     */
    onPayload(payload) {
        this.currentTask?.resolve(payload);
        this.currentTask = null;

        if (this.willQuit) {
            return this.terminate();
        }

        const nextTask = this.tasks.pick();
        if (nextTask) this.dataTask(nextTask);
    }

    /**
     * An event which catches any errors thrown by the thread itself, and then
     * rejects the promise made by the task. The exit event is emitted after
     * this.
     * @param {Error} error The error which was thrown.
     * @private
     */
    onErrorPayload(error) {
        this.currentTask?.reject(error);
        this.currentTask = null;
        this.isActive = false;
    }
}

module.exports = ThreadController;
