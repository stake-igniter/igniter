import { db } from "../db";
import { Activity, activityTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getActivity(activityId: number) {
  return await db.query.activityTable.findFirst({
    where: eq(activityTable.id, activityId),
    with: { transactions: true },
  });
}

export async function createActivity(activity: Activity) {
  return await db
    .insert(activityTable)
    .values(activity)
    .returning()
    .then((res) => res[0]);
}

export async function updateActivity(
  activityId: number,
  payload: Partial<Activity>
) {
  const activity = await getActivity(activityId);
  if (!activity) {
    throw new Error("Activity not found");
  }
  return await db
    .update(activityTable)
    .set(payload)
    .where(eq(activityTable.id, activity.id))
    .returning()
    .then((res) => res[0]);
}
