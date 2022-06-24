
const DispatchQueue = require("../../Sources/DispatchQueue");

const kTasks = 1_500;
const kInitialTasks = 300;

const sendLatencyTests = [];
const receiveLatencyTests = [];
const roundTripLatencyTests = [];

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
            sendLatencyTests.push((threadTime - startTime) * 1e3);
            receiveLatencyTests.push((endTime - threadTime) * 1e3);
            roundTripLatencyTests.push((endTime - startTime) * 1e3);
        }
    }

    console.log(`task amount          ${sendLatencyTests.length}`);
    console.log(`main -> task         ${formatted(sendLatencyTests)}`);
    console.log(`task -> main         ${formatted(receiveLatencyTests)}`);
    console.log(`main -> task -> main ${formatted(roundTripLatencyTests)}`);

    process.exit(0);
}

const queue = new DispatchQueue("./Test/Latency/Thread.js", {
    threadAmount: 1 });
setTimeout(() => latencyTest(queue), 500);
