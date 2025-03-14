import { getTemporalConfig, setupTemporalClient } from "./lib/client";
import Long from "long";

async function bootstrapNamespace() {
  const client = await setupTemporalClient();
  const config = getTemporalConfig();
  const workflowService = client.workflowService;

  const { namespace, workflowExecutionRetentionPeriod } = config;

  try {
    await workflowService.describeNamespace({ namespace });
    console.log(
      `Namespace "${namespace}" already exists. Skipping registration...`
    );
  } catch (error: any) {
    if (error.details.match(/not found/i)) {
      try {
        console.log(`Namespace "${namespace}" does not exist. Registering...`);
        await workflowService.registerNamespace({
          namespace,
          workflowExecutionRetentionPeriod: {
            seconds: Long.fromNumber(
              parseInt(workflowExecutionRetentionPeriod as string)
            ),
          },
        });
        console.log(
          `Namespace "${namespace}" registered successfully, waiting 20s for it to be fully registered...`
        );
        await new Promise((resolve) => setTimeout(resolve, 20000));
      } catch (error) {
        console.error(`Error registering namespace "${namespace}":`, error);
        throw error;
      }
    } else {
      console.error(`Error describing namespace "${namespace}":`, error);
      throw error;
    }
  }
}

async function bootstrapScheduledWorkflows() {
  return Promise.resolve();
}

export default async function bootstrap() {
  await bootstrapNamespace();
  await bootstrapScheduledWorkflows();
}
