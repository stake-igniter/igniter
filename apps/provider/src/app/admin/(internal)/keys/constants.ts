import {KeyState} from "@igniter/db/provider/enums";

export const KeyStateLabels: Record<KeyState, string> = {
  [KeyState.Available]: 'Available',
  [KeyState.Delivered]: 'Delivered',
  [KeyState.Staking]: 'Staking',
  [KeyState.Staked]: 'Staked',
  [KeyState.StakeFailed]: 'Stake Failed',
  [KeyState.Unstaking]: 'Unstaking',
  [KeyState.Unstaked]: 'Unstaked',
}
