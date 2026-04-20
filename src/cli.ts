import { Command } from 'commander';
import { getStoreById, listStores } from './store.js';

export interface RunCliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function createProgram() {
  const program = new Command();

  program
    .name('jinxi-curtain')
    .description('今喜窗帘门店信息查询工具')
    .version('1.0.0');

  program
    .command('list')
    .description('列出所有门店')
    .action(() => {
      const stores = listStores();
      console.log(JSON.stringify({ ok: true, data: { stores } }, null, 2));
    });

  program
    .command('get <storeId>')
    .description('查询指定门店信息')
    .action((storeId: string) => {
      const store = getStoreById(storeId);
      if (!store) {
        console.error(JSON.stringify({ ok: false, error: '门店不存在' }, null, 2));
        process.exit(1);
      }
      console.log(JSON.stringify({ ok: true, data: { store } }, null, 2));
    });

  return program;
}

export async function runCli(argv: string[]): Promise<RunCliResult> {
  let stdout = '';
  let stderr = '';

  const program = createProgram();
  program.configureOutput({
    writeOut: (value) => { stdout += value; },
    writeErr: (value) => { stderr += value; }
  });
  program.exitOverride();

  try {
    await program.parseAsync(argv, { from: 'user' });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    stderr += error instanceof Error ? error.message : String(error);
    return { exitCode: 1, stdout, stderr };
  }
}
