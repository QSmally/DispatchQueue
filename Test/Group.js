
const DispatchQueue = require("../Sources/DispatchQueue");

class Services {
    static main = "service_1";
    static secondary = "service_2";
}

const queues = new DispatchQueue.Group({
    [Services.main]: {
        path: "./Test/Thread.js",
        threadAmount: 2 },
    [Services.secondary]: {
        path: "./Test/Thread.js",
        threadAmount: 1,
        lazyInitialisation: true }
});

const executionTasks = [
    Services.secondary,
    Services.main,
    Services.main,
    Services.secondary,
    Services.main];
let iteration = 0;

for (const queue of executionTasks) {
    queues
        .global(queue)
        .task({ hello: "from a group!", iteration: iteration++ })
        .then(console.log)
        .catch(console.error);
}
