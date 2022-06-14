
const DispatchQueue = require("../Sources/DispatchQueue");

class Thread extends DispatchQueue.Thread {

    static automaticRejectionTime = 30;

    onSpawn() {
        if (this.dataContext.logs) {
            console.log(`[Thread ${this.identifier}] spawned`);
        }
    }

    onPayload(payload) {
        setTimeout(() => {
            if (payload.doError) {
                throw new Error(`[Thread ${this.identifier}] thrown error to see a thread restart`);
            }

            if (!payload.doTimeout) {
                this.resolve({
                    dataContext: this.dataContext.property,
                    iteration: payload.iteration,
                    thread: this.identifier
                });
            }
        }, 5).unref();
    }

    onTimeExceeded() {
        throw new Error(`[Thread ${this.identifier}] took longer than ${this.constructor.automaticRejectionTime} ms to mark task as done`);
    }
}

new Thread();
