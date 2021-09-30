
const { Worker } = require("worker_threads");
const TaskQueue  = require("../Queue/TaskQueue");

class ThreadInstance {

    /**
     * A representative class which delegates one particular worker thread.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {TaskQueue} taskQueue Reference to the central task queue.
     * @param {Object} dataContext Additional data to provide the thread.
     */
    constructor(path, taskQueue, dataContext) {
        /**
         * A path to the thread implementation.
         * @name ThreadInstance#path
         * @type {Pathlike}
         * @readonly
         */
        this.path = path;

        /**
         * Queued data tasks.
         * @name ThreadInstance#tasks
         * @type {TaskQueue}
         * @virtual reference
         * @readonly
         */
        this.tasks = taskQueue;

        /**
         * Additional data to provide the thread.
         * @name ThreadInstance#dataContext
         * @type {Object}
         * @virtual reference
         * @readonly
         */
        this.dataContext = dataContext;
    }

    /**
     * Whether this ThreadInstance has a thread already active.
     * @name ThreadInstance#isActive
     * @type {Boolean}
     * @readonly
     */
    isActive = false;

    /**
     * Indicator when this thread is scheduled to quit. The thread instance
     * will eventually exit when the queue is drained.
     * @name ThreadInstance#willQuit
     * @type {Boolean}
     * @readonly
     */
    willQuit = false;

    /**
     * Native thread interface by Node.
     * @name ThreadInstance#worker
     * @type {Worker?}
     * @readonly
     */
    worker = null;

    /**
     * Thread identifier when spawned.
     * @name ThreadInstance#threadId
     * @type {Number?}
     * @readonly
     */
    threadId = null;

    /**
     * Timestamp when this thread was last (re)spawned.
     * @name ThreadInstance#lastSpawnedAt
     * @type {Number?}
     * @readonly
     */
    lastSpawnedAt = null;

    /**
     * The currently executing data task.
     * @name ThreadInstance#currentTask
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
     * Terminates the internal thread. If the exit code was non-zero, the
     * thread will get restored.
     * @param {Number} exitCode A thread exit code.
     * @returns {Promise}
     * @async
     */
    async terminate(exitCode) {
        const exitCodeMessage = exitCode === 0 ? "" : ` with exit code ${exitCode}`;
        console.debug(`Thread ${this.threadId} terminated${exitCodeMessage}.`);

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
            return this.terminate(0);
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

module.exports = ThreadInstance;
