
const DispatchQueue = require("../../Sources/DispatchQueue");

const kTasks = 1_500;
const kInitialTasks = 300;

const tests = {
    send: [],
    receieve: [],
    roundtrip: [] };

function averaged(latencyIntegerArray) {
    const totalTime = latencyIntegerArray.reduce((accumulator, value) => accumulator + value, 0);
    return totalTime / latencyIntegerArray.length;
}

function formatted(latencyIntegerArray) {
    return "(min/avg/max) in μs: " +
        `${Math.round(Math.min(...latencyIntegerArray))} `.padEnd(5) +
        `${Math.round(averaged(latencyIntegerArray))} `.padEnd(5) +
        Math.round(Math.max(...latencyIntegerArray));
}

async function latencyTest(queue) {
    for (let iteration = 0; iteration < kTasks; iteration++) {
        const startTime = performance.now();
        const { thread: threadTime } = await queue.task({});
        const endTime = performance.now();

        if (iteration >= kInitialTasks) {
            tests.send.push((threadTime - startTime) * 1e3);
            tests.receieve.push((endTime - threadTime) * 1e3);
            tests.roundtrip.push((endTime - startTime) * 1e3);
        }
    }

    console.log(`task amount          ${tests.send.length}`);
    console.log(`main -> task         ${formatted(tests.send)}`);
    console.log(`task -> main         ${formatted(tests.receieve)}`);
    console.log(`main -> task -> main ${formatted(tests.roundtrip)}`);

    process.exit(0);
}

const queue = new DispatchQueue("./Test/Latency/Thread.js", {
    threadAmount: 1 });
setTimeout(() => latencyTest(queue), 500);
