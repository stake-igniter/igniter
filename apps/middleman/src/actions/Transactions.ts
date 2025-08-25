'use server'

import {getTransactions, getTransactionsByUser} from '@/lib/dal/transaction'
import {getCurrentUserIdentity, isUserAdmin} from "@/lib/utils/actions";

export async function GetUserTransactions() {
  const userIdentity = await getCurrentUserIdentity();
  return getTransactionsByUser(userIdentity)
}

export async function GetTransactions() {
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
        throw new Error("Unauthorized");
    }

    return getTransactions();
}
