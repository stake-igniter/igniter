import {StageStatus} from "@/app/app/(takeover)/stake/types";
import {StakingProcessStatus} from "@/app/app/(takeover)/stake/components/ReviewStep/StakingProcess";

export function stageSucceeded(stage: StageStatus) {
  return stage === 'success';
}

export function stageFailed(stage: StageStatus) {
  return stage === 'error';
}

export function getFailedStage(statusRegistry: Record<keyof StakingProcessStatus, StageStatus>) : keyof StakingProcessStatus | undefined {
  return Object.entries(statusRegistry).find(([, stage]) => stageFailed(stage))?.[0] as keyof StakingProcessStatus | undefined;
}

export function allStagesSucceeded(statusRegistry: StakingProcessStatus) {
  return Object.values(statusRegistry).every(stageSucceeded);
}
