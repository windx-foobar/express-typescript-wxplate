import { Container } from 'typedi';

import { Logger as WinstonLogger } from '../lib/logger';

export function Logger(scope: string): ParameterDecorator {
  return (object: object, propertyKey: string | symbol, index: number): any => {
    const logger = new WinstonLogger(scope);
    const propertyName = propertyKey ? propertyKey.toString() : '';
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: (): WinstonLogger => logger
    });
  };
}

export { LoggerInterface } from '@packages/core/lib/logger';
