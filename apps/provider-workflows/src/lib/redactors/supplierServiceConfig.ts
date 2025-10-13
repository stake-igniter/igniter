import {SupplierServiceConfig} from '@igniter/pocket/proto/pocket/shared/service';

export function redactSupplierServiceConfig(config: SupplierServiceConfig) {
  return {
    serviceId: config.serviceId,
    endpoints: [
      ...config.endpoints,
    ],
    revShare: [
      ...config.revShare,
    ]
  }
}

export function redactSupplierServiceConfigs(configs: SupplierServiceConfig[]) {
  return configs.map(redactSupplierServiceConfig)
}