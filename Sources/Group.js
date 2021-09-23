
class DispatchGroup {

    /**
     * @typedef {Object} DispatchQueueConfiguration
     * @property {Pathlike} path A path to the thread implementation.
     * @property {Number} threadAmount Initial amount of threads this queue
     * should spawn. It defaults to the value returned by `os.cpus().length`.
     * @property {Boolean} lazyInitialisation Whether or not to wait with
     * spawning threads until the first task is registered. By default, this
     * is disabled.
     * @property {Object} dataContext Any data to provide to the thread.
     */

    /**
     * Initialises a group of DispatchQueue configurations.
     * @param {Object<String, DispatchQueueConfiguration>} dispatchQueues
     * An object with a name/properties scheme.
     */
    constructor(dispatchQueues = {}) {
        const DispatchQueue = require("./DispatchQueue");

        for (const [name, properties] of Object.entries(dispatchQueues)) {
            const { path, threadAmount, lazyInitialisation, dataContext } = properties;
            const dispatchQueue = new DispatchQueue(path, {
                threadAmount,
                lazyInitialisation,
                dataContext });
            this.threadGroups.set(name, dispatchQueue);
        }
    }

    /**
     * A map containing all instantiated DispatchQueues.
     * @name DispatchGroup#threadGroups
     * @type {Map<String, DispatchQueue>}
     * @readonly
     */
    threadGroups = new Map();

    /**
     * Returns a configured DispatchQueue.
     * @param {String} dispatchQueueName The representative name.
     * @returns {DispatchQueue?}
     */
    global(dispatchQueueName) {
        return this.threadGroups.get(dispatchQueueName);
    }
}

module.exports = DispatchGroup;
