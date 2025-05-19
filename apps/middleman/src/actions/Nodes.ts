'use server'

import { getNodesByUser } from '@/lib/dal/nodes'
import {getCurrentUserIdentity} from "@/lib/utils/actions";

export async function GetUserNodes() {
  const userIdentity = await getCurrentUserIdentity();
  return getNodesByUser(userIdentity)
}
