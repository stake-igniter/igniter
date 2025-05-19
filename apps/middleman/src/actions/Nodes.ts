'use server'

import { getNodesByUser } from '@/lib/dal/nodes'

export async function GetUserNodes() {
  return getNodesByUser()
}
