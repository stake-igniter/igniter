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
  console.log('debug: request', request);

  return db.transaction(async trx => {
    console.log('debug: creating activity');

    const [newActivity] = await trx.insert(activityTable).values({
      type: ActivityType.Stake,
      status: ActivityStatus.Pending,
    }).returning();

    if (!newActivity) {
      throw new Error("Failed to create new activity");
    }

    console.log('debug: activity created', newActivity);

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

    console.log('debug: transactions prepared', stakeTransactions);

    const returningStakeTransactions = await trx.insert(transactionsTable).values(stakeTransactions).returning();

    console.log('debug: stake transactions created', returningStakeTransactions);

    const operationalFundsTransactions = request.operationalFundsTransactions.map(tx => {
      return {
        type: TransactionType.Send,
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

    console.log('debug: operational funds transactions prepared', operationalFundsTransactions);

    const returningOperationalFundsTransactions = await trx.insert(transactionsTable).values(operationalFundsTransactions).returning();

    console.log('debug: operational funds transactions created', returningOperationalFundsTransactions);

    return {
      ...newActivity,
      transactions: [
        ...returningStakeTransactions,
        ...returningOperationalFundsTransactions,
      ],
    };
  });
}
