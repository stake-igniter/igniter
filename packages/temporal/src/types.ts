import { Client } from '@temporalio/client'
import { Worker } from '@temporalio/worker'

export type TemporalClient = {
  client: Client;
  disconnect: () => Promise<void>;
}

export type TemporalWorker = {
  worker: Worker;
  disconnect: () => Promise<void>;
}

export type TemporalConfig = {
  address: string;
  taskQueue: string;
  namespace: string;
  workflowExecutionRetentionPeriod: string;
}
