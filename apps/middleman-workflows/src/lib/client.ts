import { Client, Connection } from "@temporalio/client";

declare global {
  // eslint-disable-next-line no-var
  var temporal: Client;
}

const checkEnvVariables = (vars: string[]) => {
  //check if all env variables are set
  vars.forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`Missing env variable: ${v}`);
    }
  });
};

export const getTemporal = () => global.temporal;

export const getTemporalConfig = () => {
  return {
    taskQueue: process.env.TEMPORAL_TASK_QUEUE,
    namespace: process.env.TEMPORAL_NAMESPACE,
    workflowExecutionRetentionPeriod: process.env.TEMPORAL_WORKFLOW_RETENTION,
  };
};

export const setupTemporalClient = async (): Promise<Client> => {
  if (global.temporal) return global.temporal;

  if (process.env.NODE_ENV === "production") {
    checkEnvVariables([
      "TEMPORAL_URL",
      "TEMPORAL_NAMESPACE",
      "TEMPORAL_TASK_QUEUE",
    ]);
  }

  console.log(`Setting UP Temporal Client`);

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_URL,
  });

  console.log(`Connected to Temporal at ${process.env.TEMPORAL_URL}`);

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE,
  });

  console.log(`Temporal Client created`);

  global.temporal = client;

  return client;
};
