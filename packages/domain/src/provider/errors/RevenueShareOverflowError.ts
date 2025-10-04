/**
 * Thrown when the calculated sum of all revenue–share
 * percentages exceeds the allowed maximum (typically 100 %).
 *
 * Example usage:
 * ```ts
 * if (totalShare > 1) {
 *   throw new RevenueShareOverflowError(totalShare);
 * }
 * ```
 */
export class RevenueShareOverflowError extends Error {
    /**
     * @param totalShare  The offending total share (e.g. 107).
     */
    constructor(
        public readonly totalShare: number,
    ) {
        super(
            `Revenue share overflow: received ${totalShare}% while the maximum allowed is 100%.`
        );
        this.name = 'RevenueShareOverflowError';

        Object.setPrototypeOf(this, RevenueShareOverflowError.prototype);
    }
}