import { CompareSupplierServiceConfigHandler } from '@igniter/domain/provider/operations';

import type {
    SupplierServiceConfig,
    ServiceRevenueShare,
    SupplierEndpoint,
    ConfigOption,
} from '@igniter/pocket';

const rs = (address: string): ServiceRevenueShare => ({ address });
const co = (key: number, value: string): ConfigOption => ({ key, value });
const ep = (
    url: string,
    rpcType: number,
    configs: ConfigOption[] = [],
): SupplierEndpoint => ({ url, rpcType, configs });
const cfg = (
    serviceId: string,
    revShare: ServiceRevenueShare[] = [],
    endpoints: SupplierEndpoint[] = [],
): SupplierServiceConfig => ({ serviceId, revShare, endpoints });

describe('CompareSupplierServiceConfigHandler', () => {
    let handler: CompareSupplierServiceConfigHandler;

    beforeAll(() => {
      handler = new CompareSupplierServiceConfigHandler();
    });

    it('returns true for semantically identical but differently ordered sets', () => {
        const a = [
            cfg(
                'svc-1',
                [rs('0xAAA'), rs('0xBBB')],
                [
                    ep('https://foo', 1, [co(1, 'x'), co(2, 'y')]),
                    ep('https://bar', 2),
                ],
            ),
            cfg('svc-2'),
        ];
        const b = [
            cfg('svc-2'),
            cfg(
                'svc-1',
                [rs('0xBBB'), rs('0xAAA')], // swapped order
                [
                    ep('https://bar', 2),
                    ep('https://foo', 1, [co(2, 'y'), co(1, 'x')]), // swapped order
                ],
            ),
        ];

        const result = handler.execute({ serviceConfigSetA: a, serviceConfigSetB: b });

        expect(result.isEqual).toBe(true);
        expect(result.diff).toEqual([]);
    });

    it('returns false when service IDs differ', () => {
        const a = [cfg('svc-1')];
        const b = [cfg('svc-2')];

        const result = handler.execute({ serviceConfigSetA: a, serviceConfigSetB: b });

        expect(result.isEqual).toBe(false);
        expect(result.diff.length).toBeGreaterThan(0);
    });

    it('returns false when list lengths differ', () => {
        const a = [cfg('svc-1')];
        const b: SupplierServiceConfig[] = [];

        const result = handler.execute({ serviceConfigSetA: a, serviceConfigSetB: b });

        expect(result.isEqual).toBe(false);
        expect(result.diff.length).toBeGreaterThan(0);
    });
});