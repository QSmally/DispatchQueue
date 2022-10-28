
class DispatchGroup {

    /**
     * @typedef {Object} DispatchQueueGroupConfiguration
     * @property {Pathlike} path A path to the thread implementation.
     * @property {Number} threadAmount Initial amount of threads this queue should spawn. It defaults to the value returned by `os.cpus().length`.
     * @property {Boolean} lazyInitialisation Whether or not to wait with spawning threads until the first task is created. By default, this is disabled.
     * @property {Object} dataContext Any data to provide to the thread.
     * @property {Boolean} logs Logs for debugging thread behaviour. By default, this is disabled.
     */

    /**
     * Initialises a group of DispatchQueue configurations.
     * @param {Object<String, DispatchQueueGroupConfiguration>} dispatchQueues An object with an id/properties scheme.
     */
    constructor(dispatchQueues = {}) {
        const DispatchQueue = require("./DispatchQueue");

        for (const [id, properties] of Object.entries(dispatchQueues)) {
            const { path, threadAmount, lazyInitialisation, dataContext, logs } = properties;
            const dispatchQueue = new DispatchQueue(path, {
                threadAmount,
                lazyInitialisation,
                dataContext,
                logs });
            this.threadGroups.set(id, dispatchQueue);
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
     * @param {String} dispatchQueueId The representative queue id.
     * @returns {DispatchQueue?}
     */
    global(dispatchQueueId) {
        return this.threadGroups.get(dispatchQueueId);
    }
}

module.exports = DispatchGroup;
