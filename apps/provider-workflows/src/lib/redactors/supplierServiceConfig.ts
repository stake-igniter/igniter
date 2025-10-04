import {SupplierServiceConfig} from '@igniter/pocket';

export function redactSupplierServiceConfig(config: SupplierServiceConfig) {
  return {
    serviceId: config.serviceId,
    endpoints: [
      ...config.endpoints,
    ],
  }
}

export function redactSupplierServiceConfigs(configs: SupplierServiceConfig[]) {
  return configs.map(redactSupplierServiceConfig)
}