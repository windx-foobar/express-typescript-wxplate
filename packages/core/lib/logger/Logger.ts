import * as path from 'path';
import * as winston from 'winston';
import { config } from '../../config';

/**
 * core.Log
 * ------------------------------------------------
 *
 * This is the main Logger Object. You can create a scope logger
 * or directly use the static log methods.
 *
 * By Default it uses the debug-adapter, but you are able to change
 * this in the start up process in the core/index.ts file.
 */

export class Logger {
  public static DEFAULT_SCOPE = 'app';

  private static parsePathToScope(filepath: string): string {
    if (filepath.indexOf(path.sep) >= 0) {
      filepath = filepath.replace(process.cwd(), '');
      filepath = filepath.replace(`${path.sep}app${path.sep}`, '');
      filepath = filepath.replace(`${path.sep}database${path.sep}`, '');
      filepath = filepath.replace(`${path.sep}public${path.sep}`, '');
      filepath = filepath.replace(`${path.sep}dist${path.sep}`, '');
      filepath = filepath.replace('.ts', '');
      filepath = filepath.replace('.js', '');
      filepath = filepath.replace(path.sep, ':');
    }
    return filepath;
  }

  private readonly scope: string;

  constructor(scope?: string) {
    this.scope = Logger.parsePathToScope((
      scope
    ) ? scope : Logger.DEFAULT_SCOPE);
  }

  public debug(message: string, ...args: any[]): void;
  public debug(...args: any[]): void {
    if (typeof args[0] === 'string') {
      return this.log('debug', args[0], args.slice(1));
    } else {
      return this.log('debug', 'Debug message', args);
    }
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, args);
  }

  private log(level: string, message: string, args: any[]): void {
    if (level === 'debug' && !config?.isProduction) {
      console.log('[RAW DEBUG]', message, ...args);
    } else {
      if (winston) {
        winston[level](`${this.formatScope()} ${message}`, args);
      }
    }
  }

  private formatScope(): string {
    return `[${this.scope}]`;
  }

}
