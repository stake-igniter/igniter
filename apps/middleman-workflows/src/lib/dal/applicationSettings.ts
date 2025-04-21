import { db } from "@/lib/db";

export async function getApplicationSettingsFromDatabase() {
  return db.query.applicationSettingsTable.findFirst();
}
