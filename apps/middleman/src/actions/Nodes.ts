'use server'

import { getNode, getNodesByUser } from '@/lib/dal/nodes'
import {getCurrentUserIdentity} from "@/lib/utils/actions";

export async function GetUserNodes() {
  const userIdentity = await getCurrentUserIdentity();
  return getNodesByUser(userIdentity)
}

export async function GetNode(address: string) {
  const [node, userIdentity] = await Promise.all([
    getNode(address),
    getCurrentUserIdentity()
  ])

  if (!node) {
    throw new Error("Node not found")
  }

  if (node.createdBy !== userIdentity) {
    throw new Error("Unauthorized")
  }

  return node
}
