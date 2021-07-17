
const { Worker }  = require("worker_threads");
const ThreadQueue = require("../Queue/ThreadQueue");

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
     * Native thread interface by Node.
     * @name ThreadInstance#worker
     * @type {Worker?}
     * @readonly
     */
    worker = null;

    /**
     * Thread identifier when spawned.
     * @name ThreadInstance#threadId
     * @type {Number}
     */
    get threadId() {
        return this.worker?.threadId;
    }

    /**
     * Queued data tasks.
     * @name ThreadInstance#tasks
     * @type {ThreadQueue}
     * @readonly
     */
    tasks = new ThreadQueue();

    /**
     * The currently executing data task.
     * @name ThreadInstance#currentTask
     * @type {Object?}
     * @readonly
     */
    currentTask = null;

    /**
     * Spawns a thread and assigns it active.
     * @returns {Worker}
     */
    spawn() {
        this.worker = new Worker(this.path)
            .once("online", () => { this.isActive = true; })
            .once("exit", code => this.restart(code))
            .on("message", payload => this.onPayload(payload))
            .on("error", error => this.onErrorPayload(error));
        return this.worker;
    }

    /**
     * @param {Number} code A thread exit code.
     * @returns {undefined}
     * @async
     */
    async restart(code) {
        if (code !== 0 && process.env.THREAD_DEBUG === true) {
            const groupIdentifier = this.groupIdentifier ? ` of group '${this.groupIdentifier}'` : "";
            console.debug(`Thread ${this.threadId}${groupIdentifier} quit with a non-zero exit code: ${code}`);
        }

        await this.terminate();

        if (code !== 0) {
            this.spawn();
        }
    }

    /**
     * Terminates the internal thread.
     * @returns {Promise}
     * @async
     */
    async terminate() {
        this.isActive = false;
        this.worker?.removeAllListeners();
        await this.worker?.terminate();

        this.worker = null;
    }

    /**
     * Inserts a task into the thread's queue.
     * @param {Object} payload 
     * @returns {Promise}
     * @async
     */
    async dataTask(payload) {
        await this.tasks.wait();
        this.worker.postMessage(payload);
        this.currentTask = ThreadQueue.createAsyncPromise();
        return await this.currentTask.promise;
    }

    /**
     * An event which is performed whenever a response
     * from the thread is received.
     * @param {Object} [payload] 
     * @private
     */
    onPayload(payload) {
        this.currentTask?.resolve(payload);
        this.currentTask = null;
        this.tasks.nextTask();
    }

    /**
     * An event which catches any errors thrown by the
     * thread itself, and then rejects the promise made
     * by the task.
     * @param {Error} error 
     * @private
     */
    onErrorPayload(error) {
        this.currentTask?.reject(error);
        this.currentTask = null;
        this.tasks.nextTask();
    }
}

module.exports = ThreadInstance;
