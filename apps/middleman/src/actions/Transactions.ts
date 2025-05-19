'use server'

import { getTransactionsByUser } from '@/lib/dal/transaction'
import {getCurrentUserIdentity} from "@/lib/utils/actions";

export async function GetUserTransactions() {
  const userIdentity = await getCurrentUserIdentity();
  return getTransactionsByUser(userIdentity)
}
