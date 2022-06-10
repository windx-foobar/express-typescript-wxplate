import { spawnWithEvents } from '@packages/core/utils';
import { config } from '@packages/core/config';

import { DbCommand } from './abstracts/db';

export class DbRevertCommand extends DbCommand {
  constructor() {
    super();

    this.registerOption(
      '--migrations-path <path>',
      'Директория с миграциями',
      config.app.dirs.migrationsDir
    )
      .registerOption(
        '--to <name>',
        'До какой миграции откатить',
        ''
      );
  }

  protected get name() {
    return 'db.revert';
  }

  protected get description() {
    return 'Откат миграций базы данных';
  }

  protected async handle(options: any): Promise<any> {
    // 1. Сборка строки для sequelize-cli
    const connectionString = this.stepConnectionString(options);

    // 2. Выполнение команды sequelize-cli (db:migrate:undo:all)
    await this.stepHandleSequelizeCommand(connectionString, options);
  }

  private async stepHandleSequelizeCommand(connectionString: string, options: any) {
    const { migrationsPath, to = '' } = options;

    if (!migrationsPath) return this.error('Путь до миграций не указан в опциях');
    if (!connectionString) return this.error('Не собрана строка подключения к базе');

    const commandArgs = [
      '-T',
      `${process.cwd()}/node_modules/sequelize-cli/lib/sequelize`,
      'db:migrate:undo:all',
      `--migrations-path=${migrationsPath}`,
      `--url=${connectionString}`
    ];

    if (to?.trim()?.length) commandArgs.push(`--to=${to}`);

    this.log('Запуск команды\n', `\tts-node ${commandArgs.join(' ')}`);
    const child = await spawnWithEvents('ts-node', commandArgs);

    child.stdout.on('data', (data: Buffer) => {
      const logData = data.toString().trim();

      if (this.filterLogMessageFromSequelize(logData)) {
        this.externalLog('Sequelize CLI', 'yellow', this.translateFromSequelize(logData));
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      const logData = data.toString().trim();

      if (this.filterLogMessageFromSequelize(logData)) {
        this.externalLog('Sequelize CLI', 'red', this.translateFromSequelize(logData));
      }
    });

    child.on('exit', (code) => {
      if (+code === 1) {
        this.error('Команда выполнилась с ошибкой!');
      } else {
        this.success('Команда успешно выполнилась!');
      }
    });
  }
}

new DbRevertCommand().start();
