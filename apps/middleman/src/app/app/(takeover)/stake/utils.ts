import {StageStatus} from "@/app/app/(takeover)/stake/types";

export function stageSucceeded(stage: StageStatus) {
  return stage === 'success';
}

export function stageFailed(stage: StageStatus) {
  return stage === 'error';
}

export function getFailedStage<T extends Record<string, StageStatus>>(statusRegistry: Record<string, StageStatus>) : keyof T | undefined {
  return Object.entries(statusRegistry).find(([, stage]) => stageFailed(stage))?.[0];
}

export function allStagesSucceeded(statusRegistry: Record<string, StageStatus>) {
  return Object.values(statusRegistry).every(stageSucceeded);
}
