import "server-only";
import { db } from "@/db";
import {
  Activity,
  ActivityStatus,
  activityTable,
  ActivityType,
  transactionsTable,
  TransactionStatus,
  TransactionType
} from "@/db/schema";
import {CreateStakeActivityRequest} from "@/lib/models/Activities";

export async function createStakeActivity(request: CreateStakeActivityRequest) : Promise<Activity> {
  return db.transaction(async trx => {
    const [newActivity] = await trx.insert(activityTable).values({
      type: ActivityType.Stake,
      status: ActivityStatus.Pending,
      totalValue: request.stakeTransactions.reduce((acc, tx) => acc + tx.amount, 0),
    }).returning();

    if (!newActivity) {
      throw new Error("Failed to create new activity");
    }

    const stakeTransactions = request.stakeTransactions.map(tx => {
      return {
        type: TransactionType.Stake,
        status: TransactionStatus.Pending,
        amount: tx.amount,
        signedPayload: tx.signedPayload,
        fromAddress: tx.outputAddress,
        activityId: newActivity.id,
      };
    });

    const returningStakeTransactions = await trx.insert(transactionsTable).values(stakeTransactions).returning();

    const operationalFundsTransactions = request.operationalFundsTransactions.map(tx => {
      return {
        type: TransactionType.OperationalFunds,
        status: TransactionStatus.Pending,
        amount: tx.amount,
        signedPayload: tx.signedPayload,
        fromAddress: tx.fromAddress,
        activityId: newActivity.id,
        dependsOn: returningStakeTransactions.find(t => t.signedPayload === tx.dependsOn)?.id,
      };
    });

    if (operationalFundsTransactions.some(t => !t.dependsOn)) {
      throw new Error("Some operational funds transactions are missing their dependency. Something is wrong.");
    }

    const returningOperationalFundsTransactions = await trx.insert(transactionsTable).values(operationalFundsTransactions).returning();

    return {
      ...newActivity,
      transactions: [
        ...returningStakeTransactions,
        ...returningOperationalFundsTransactions,
      ],
    };
  });
}

export async function getActivitiesByUser() {
  return db.query.activityTable.findMany({
    with: {
      transactions: true,
    },
  });
}
