import { NativeConnection, Worker } from "@temporalio/worker";

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233"
  });
  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve("./hotel_orchestrator"),
    activities: require("./activities"),
    taskQueue: "hotel-task-queue"
  });
  await worker.run();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
