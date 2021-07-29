
const DispatchQueue = require("../Sources/DispatchQueue");

class Thread extends DispatchQueue.Thread {
    onSpawn() {
        console.log(`thread ${this.id} spawned`);
    }

    onPayload(payload) {
        setTimeout(() => {
            if (payload.shouldError) throw new Error(`[from thread ${this.id}] thrown error to see a thread restart`);
            this.resolve({ ...payload, fromThread: this.id });
        }, 5).unref();
    }
}

new Thread();
