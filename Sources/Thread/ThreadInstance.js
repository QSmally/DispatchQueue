
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
}

module.exports = ThreadInstance;
