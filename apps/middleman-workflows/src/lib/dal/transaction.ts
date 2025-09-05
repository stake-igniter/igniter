import { eq } from "drizzle-orm";
import type { Logger } from '@igniter/logger'
import type { DBClient } from '@igniter/db/connection'
import * as schema from '@igniter/db/middleman/schema'
import { transactionsTable, Transaction as TransactionModel } from '@igniter/db/middleman/schema'
import { TransactionStatus } from '@igniter/db/middleman/enums'

export default class Transaction {
  logger: Logger

  dbClient: DBClient<typeof schema>

  /**
   * Constructs a new instance of the class.
   *
   * @param {DBClient<typeof schema>} dbClient - The database client instance used for database operations.
   * @param {Logger} logger - The logger instance used for logging activities in the application.
   */
  constructor(dbClient: DBClient<typeof schema>, logger: Logger) {
    this.logger = logger
    this.dbClient = dbClient
  }

  async getTransaction(transactionId: number) {
    return this.dbClient.db.query.transactionsTable.findFirst({
      where: eq(transactionsTable.id, transactionId),
    });
  }

  async listByStatus(status: TransactionStatus) {
    return this.dbClient.db.query.transactionsTable.findMany({
      where: eq(transactionsTable.status, status)
    });
  }

  async updateTransaction(
    transactionId: number,
    payload: Partial<TransactionModel>
  ) {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return await this.dbClient.db
      .update(transactionsTable)
      .set(payload)
      .where(eq(transactionsTable.id, transaction.id))
      .returning()
      .then((res) => res[0]);
  }
}
