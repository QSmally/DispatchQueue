
const DispatchQueue = require("../Sources/DispatchQueue");

class Thread extends DispatchQueue.Thread {
    onSpawn() {
        console.log(`thread ${this.identifier} spawned`);
    }

    onPayload(payload) {
        setTimeout(() => {
            if (payload.shouldError) throw new Error(`[from thread ${this.identifier}] thrown error to see a thread restart`);
            this.resolve({ ...payload, fromThread: this.identifier });
        }, 5).unref();
    }
}

new Thread();
