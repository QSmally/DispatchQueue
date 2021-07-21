
class DispatchGroup {

    /**
     * Initialises a group of DispatchQueue configurations.
     * @param {Object} dispatchQueues An object with a name/properties scheme.
     */
    constructor(dispatchQueues = {}) {
        for (const [name, properties] of Object.entries(dispatchQueues)) {
            this.threadGroups.set(name, this.createDispatchQueue(properties));
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
     * Creates one particular DispatchQueue configuration.
     * @param {Object} properties An object of properties describing it.
     * @returns {DispatchQueue}
     * @private
     */
    createDispatchQueue({ path, threadAmount, deferThreadInit }) {
        const DispatchQueue = require("./DispatchQueue");
        return new DispatchQueue(path, threadAmount, deferThreadInit);
    }

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
