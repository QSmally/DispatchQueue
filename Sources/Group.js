
class DispatchGroup {

    /**
     * Initialises a group of DispatchQueue configurations.
     * @param {Object} dispatchQueues An object with a name/properties scheme.
     */
    constructor(dispatchQueues = {}) {
        const DispatchQueue = require("./DispatchQueue");

        for (const [name, properties] of Object.entries(dispatchQueues)) {
            const { path, threadAmount, lazyInitialisation } = properties;
            const dispatchQueue = new DispatchQueue(path, threadAmount, lazyInitialisation);
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
