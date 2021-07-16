
const ThreadInstance = require("./ThreadInstance");

class ThreadController {

    /**
     * A class which interfaces a thread queue.
     * @param {Pathlike} path A path to the thread implementation.
     * @param {Number} threadAmount Initial amount of threads.
     */
    constructor(path, threadAmount) {
        for (let i = 0; i < threadAmount; i++) {
            this.workers.push(new ThreadInstance(path));
        }
    }

    /**
     * An array of currently instantiated threads.
     * @name ThreadController#workers
     * @type {ThreadInstance}
     */
    workers = [];
}

module.exports = ThreadController;
