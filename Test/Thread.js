
const DispatchQueue = require("../Sources/DispatchQueue");

class Thread extends DispatchQueue.Thread {

    static automaticRejectionTime = 30;

    onSpawn() {
        console.log(`Thread ${this.identifier} spawned`);
    }

    onPayload(payload) {
        setTimeout(() => {
            if (payload.shouldError) throw new Error(`[from thread ${this.identifier}] thrown error to see a thread restart`);
            if (!payload.shouldTimeout) this.resolve({ hello: "world!", iteration: payload.iteration, fromThread: this.identifier });
        }, 5).unref();
    }

    onTimeExceeded() {
        throw new Error(`[from thread ${this.identifier}] took longer than ${this.constructor.automaticRejectionTime} ms to mark task as done`);
    }
}

new Thread();
