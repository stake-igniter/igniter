const UPOKT_CONSTANT = 1e6;

export function amountToPokt(amount: string): number {
  return Number(amount) / UPOKT_CONSTANT;
}
