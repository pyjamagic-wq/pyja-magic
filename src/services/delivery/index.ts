import { DeliveryProvider } from './DeliveryProvider';
import { YalidineProvider } from './YalidineProvider';
import { MockDeliveryProvider } from './MockDeliveryProvider';

export * from './DeliveryProvider';
export * from './YalidineProvider';
export * from './MockDeliveryProvider';

export function getDeliveryProvider(apiKey?: string, apiToken?: string): DeliveryProvider {
  if (apiKey && apiToken) {
    return new YalidineProvider(apiKey, apiToken);
  }
  return new MockDeliveryProvider();
}
