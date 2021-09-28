
class TaskQueue {

    /**
     * The property that holds all queued items.
     * @name TaskQueue#queue
     * @type {Array<Task>}
     * @readonly
     */
    queue = [];

    /**
     * Returns the amount of items remaining in the queue.
     * @name TaskQueue#remaining
     * @type {Number}
     */
    get remaining() {
        return this.queue.length;
    }

    /**
     * Adds a new task to the queue.
     * @param {Task} task A thread task.
     */
    schedule(task) {
        this.queue.push(task);
    }

    /**
     * Marks the the longest living task from the queue to be processed on a
     * thread and removes it from the queue immediately.
     * @returns {Task?}
     */
    pick() {
        return this.queue.shift();
    }
}

module.exports = TaskQueue;
