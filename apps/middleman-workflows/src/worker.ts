import { NativeConnection, Worker } from "@temporalio/worker";
import { delegatorActivities } from "./activities";
import bootstrap from "./bootstrap";
import {Blockchain} from "@/lib/blockchain";

export async function setupTemporalWorker() {
  const TEMPORAL_URL = process.env.TEMPORAL_URL || "localhost:7233";

  const connection = await NativeConnection.connect({
    address: TEMPORAL_URL,
  });

  const NAMESPACE = process.env.TEMPORAL_NAMESPACE || "middleman";
  const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || "middleman-operations";
  const POCKET_RPC = process.env.POKT_RPC_URL || '';

  if (!POCKET_RPC) {
    throw new Error("POKT_RPC_URL environment variable is not defined.");
  }

  await bootstrap();

  const blockchainProvider = new Blockchain(POCKET_RPC);

  const shutdownGraceTime = 2500;

  const worker = await Worker.create({
    connection,
    namespace: NAMESPACE,
    taskQueue: TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
    activities: delegatorActivities(blockchainProvider),
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

  await worker.run();
}

setupTemporalWorker().catch((err) => console.log(err));
