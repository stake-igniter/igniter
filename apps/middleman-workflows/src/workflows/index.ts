import * as wf from "@temporalio/workflow";
import type * as activities from "@/activities";

export async function TestWorkflow() {
  const { testActivity } = wf.proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute",
  });

  await testActivity();

  return "success";
}
