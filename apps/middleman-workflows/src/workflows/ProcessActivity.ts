import { log, proxyActivities, startChild } from "@temporalio/workflow";
import { createActivities } from "../activities";
import { ActivityStatus, ActivityType } from "../lib/db/schema";

export interface ProcessActivityArgs {
  activityId: number;
}

export async function ProcessActivity(args: ProcessActivityArgs) {
  const { listActivities } = proxyActivities<
    ReturnType<typeof createActivities>
  >({
    startToCloseTimeout: "30s",
    retry: {
      maximumAttempts: 3,
    },
  });

  const activities = await listActivities();

  const pendingActivities = activities.filter(
    (activity) => activity.status === ActivityStatus.Pending
  );

  const childWorkflows = [];
  for (const activity of pendingActivities) {
    const activityType = activity.type as ActivityType;

    const handle = await startChild(`Execute${activityType}`, {
      args: [
        {
          activityId: activity.id,
        },
      ],
      parentClosePolicy: "ABANDON",
      workflowId: `Execute${activityType}-${activity.id}`,
    });
    childWorkflows.push(handle.result());
  }

  if (childWorkflows.length) {
    log.info(`Triggered execution of ${childWorkflows.length} activities`);
  }

  return "Success";
}
