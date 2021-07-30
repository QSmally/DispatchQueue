
const { Worker } = require("worker_threads");
const TaskQueue  = require("../Queue/TaskQueue");

class ThreadInstance {

    /**
     * A representative class which delegates one particular worker thread.
     * @param {Pathlike} path A path to the thread implementation.
     */
    constructor(path) {
        /**
         * A path to the thread implementation.
         * @name ThreadInstance#path
         * @type {Pathlike}
         * @readonly
         */
         Object.defineProperty(this, "path", {
            enumerable: true,
            writable: false,
            value: path
        });
    }

    /**
     * Whether this ThreadInstance has a thread already active.
     * @name ThreadInstance#isActive
     * @type {Boolean}
     * @readonly
     */
    isActive = false;

    /**
     * Indicator when this thread is scheduled to quit. The thread
     * instance will finally exit when the queue is drained.
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
     * Queued data tasks.
     * @name ThreadInstance#tasks
     * @type {TaskQueue}
     * @readonly
     */
    tasks = new TaskQueue();

    /**
     * The currently executing data task.
     * @name ThreadInstance#currentTask
     * @type {Object?}
     * @readonly
     */
    currentTask = null;

    /**
     * Spawns a thread and caches its unique
     * thread identifier. When the worker is active,
     * it marks it as usable.
     * @returns {Worker}
     */
    spawn() {
        this.worker = new Worker(this.path)
            .once("online", () => this.isActive = true)
            .once("exit", code => this.restart(code))
            .on("message", payload => this.onPayload(payload))
            .on("error", error => this.onErrorPayload(error));

        this.threadId = this.worker.threadId;
        this.lastSpawnedAt = Date.now();
        return this.worker;
    }

    /**
     * Conditionally restarts the thread if it's not
     * queued for exit.
     * @param {Number} code A thread exit code.
     * @returns {undefined}
     * @async
     */
    async restart(code) {
        await this.terminate(code);
        this.tasks.nextTask();

        if (code !== 0 && !this.willQuit && this.tasks.remaining !== 0) {
            this.spawn();
        }
    }

    /**
     * Terminates the internal thread.
     * @param {Number?} exitCode A thread exit code.
     * @returns {Promise}
     * @async
     */
    async terminate(exitCode) {
        const exitCodeMessage = isNaN(exitCode) ? "" : ` with code ${exitCode}`;
        console.debug(`Thread ${this.threadId} terminated${exitCodeMessage}.`);

        this.isActive = false;
        this.worker?.removeAllListeners();
        await this.worker?.terminate();

        this.worker = null;
        this.threadId = null;
    }

    /**
     * Inserts a task into the thread's queue.
     * @param {Object} payload A thread payload.
     * @returns {Promise}
     * @async
     */
    async dataTask(payload) {
        await this.tasks.wait();
        this.worker.postMessage(payload);
        this.currentTask = TaskQueue.createAsyncPromise();
        return await this.currentTask.promise;
    }

    /**
     * An event which is performed whenever a response
     * from the thread is received.
     * @param {Object} [payload] The thread's response payload.
     * @returns {undefined}
     * @private
     */
    onPayload(payload) {
        this.currentTask?.resolve(payload);
        this.currentTask = null;
        this.tasks.nextTask();

        if (this.willQuit && this.tasks.remaining === 0) {
            this.terminate();
        }
    }

    /**
     * An event which catches any errors thrown by the
     * thread itself, and then rejects the promise made
     * by the task.
     * @param {Error} error The error which was thrown.
     * @returns {undefined}
     * @private
     */
    onErrorPayload(error) {
        this.currentTask?.reject(error);
        this.currentTask = null;
    }
}

module.exports = ThreadInstance;
