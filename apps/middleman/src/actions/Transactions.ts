'use server'

import { getTransactionsByUser } from '@/lib/dal/transaction'

export async function GetUserTransactions() {
  return getTransactionsByUser()
}
