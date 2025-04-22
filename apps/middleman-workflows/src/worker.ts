import { NativeConnection, Worker } from "@temporalio/worker";
import { createActivities } from "./activities";
import bootstrap from "./bootstrap";
import setupPoktProvider, { BlockchainProtocol } from "./lib/blockchain/pokt";

export async function setupTemporalWorker() {
  // Step 1: Establish a connection with Temporal server.
  //
  // Worker code uses `@temporalio/worker.NativeConnection`.
  // (But in your application code it's `@temporalio/client.Connection`.)

  const TEMPORAL_URL = process.env.TEMPORAL_URL || "localhost:7233";

  const connection = await NativeConnection.connect({
    address: TEMPORAL_URL,
    // TLS and gRPC metadata configuration goes here.
  });
  // Step 2: Register Workflows and Activities with the Worker and specify your
  // namespace and Task Queue.

  //need to fetch datasources and pass them to createActivities

  const NAMESPACE = process.env.TEMPORAL_NAMESPACE || "middleman";
  const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || "middleman-operations";
  const BLOCKCHAIN_PROTOCOL = (process.env.BLOCKCHAIN_PROTOCOL ||
    BlockchainProtocol.Morse) as BlockchainProtocol;

  await bootstrap();

  const blockchainProvider = setupPoktProvider(BLOCKCHAIN_PROTOCOL);

  const shutdownGraceTime = 2500;

  const worker = await Worker.create({
    connection,
    namespace: NAMESPACE,
    taskQueue: TASK_QUEUE,
    // Workflows are registered using a path as they run in a separate JS context.
    workflowsPath: require.resolve("./workflows"),
    activities: createActivities(blockchainProvider),
    shutdownGraceTime,
  });

  process.on("SIGHUP", function () {
    console.log("Received SIGHUP, shutting down gracefully...");
    worker.shutdown();
    setTimeout(() => {
      console.log("Forcefully shutting down...");
      process.kill(process.pid, "SIGTERM");
    }, shutdownGraceTime);
  })

  // Step 3: Start accepting tasks on the `background-check` queue
  //
  // The worker runs until it encounters an unexepected error or the process receives a shutdown signal registered on
  // the SDK Runtime object.
  //
  // By default, worker logs are written via the Runtime logger to STDERR at INFO level.
  //
  // See https://typescript.temporal.io/api/classes/worker.Runtime#install to customize these defaults.
  await worker.run();
}

setupTemporalWorker().catch((err) => console.log(err));
