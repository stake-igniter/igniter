import {RemediationHistoryEntry} from "@igniter/db/provider/schema";

/**
 * Adds a new remediation history entry to the list or updates an existing entry if one with the same reason exists.
 *
 * @param {RemediationHistoryEntry} entry - The remediation history entry to be added or updated.
 * @param {RemediationHistoryEntry[]} remediationHistory - The list of existing remediation history entries.
 * @return {RemediationHistoryEntry[]} Updated list of remediation history entries.
 */
export function addOrUpdateRemediationHistory(entry: RemediationHistoryEntry, remediationHistory: RemediationHistoryEntry[]) : RemediationHistoryEntry[] {
  const existingEntryIndex = remediationHistory.findIndex(
    (item) => item.reason === entry.reason
  );

  if (existingEntryIndex !== -1) {
    remediationHistory[existingEntryIndex] = entry;
    return remediationHistory;
  }

  return [...remediationHistory, entry].sort((a, b) => b.timestamp - a.timestamp);
}