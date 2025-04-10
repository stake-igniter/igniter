import { Duration } from "@temporalio/common";
import { getTemporalConfig, setupTemporalClient } from "./lib/client";
import Long from "long";

enum ScheduledWorkflowType {
  ProviderStatus = "ProviderStatus",
  ProcessActivity = "ProcessActivity",
}

const ScheduledWorkflowConfig: Record<
  ScheduledWorkflowType,
  { interval: string }
> = {
  [ScheduledWorkflowType.ProviderStatus]: { interval: "10m" },
  [ScheduledWorkflowType.ProcessActivity]: { interval: "2m" },
};

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
  const client = await setupTemporalClient();
  const config = getTemporalConfig();

  for (const type of Object.values(ScheduledWorkflowType)) {
    const workflowType = type;
    const { interval } = ScheduledWorkflowConfig[workflowType];
    try {
      await client.connection.workflowService.describeSchedule({
        namespace: config.namespace,
        scheduleId: `${workflowType}-scheduled`,
      });
      console.log(
        `Scheduled workflow "${workflowType}" already exists. Skipping registration...`
      );
    } catch (error: unknown) {
      try {
        console.log(
          `Scheduled workflow "${workflowType}" does not exist. Registering...`
        );
        await client.schedule.create({
          action: {
            type: "startWorkflow",
            workflowType,
            taskQueue: config.taskQueue!,
          },
          scheduleId: `${workflowType}-scheduled`,
          spec: {
            intervals: [{ every: interval as Duration }],
          },
        });
      } catch (error) {
        console.error(`Error scheduling ${workflowType}`, error);
        throw error;
      }
    }
  }
}

export default async function bootstrap() {
  await bootstrapNamespace();
  await bootstrapScheduledWorkflows();
}
