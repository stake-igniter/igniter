import {LoadKeysInRangeParams} from "@/activities";
import {KeyState} from "@igniter/db/provider/enums";

/**
 * Divides a range of IDs into smaller ranges of specified size.
 *
 * @param {number} minId - The starting ID of the range.
 * @param {number} maxId - The ending ID of the range.
 * @param {number} shardSize - The size of each range or shard.
 * @return {Array<LoadKeysInRangeParams>} An array of objects, each representing a range with `startId` and `endId`.
 */
export function makeRangesBySize(minId: number, maxId: number, shardSize: number, states: KeyState[]): Array<LoadKeysInRangeParams> {
  const ranges: Array<LoadKeysInRangeParams> = []
  for (let start = minId; start <= maxId; start += shardSize) {
    const end = Math.min(start + shardSize - 1, maxId)
    ranges.push({
      minId: start,
      maxId: end,
      states,
    })
  }
  return ranges
}