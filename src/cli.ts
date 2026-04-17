#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { listSnapshots, loadSnapshot } from './snapshot';

const program = new Command();

program
  .name('routewatch')
  .description('Monitor and diff REST API endpoint changes over time')
  .version('0.1.0');

program
  .command('snapshots')
  .description('List all saved snapshots')
  .action(async () => {
    const snapshots = await listSnapshots();
    if (snapshots.length === 0) {
      console.log(chalk.yellow('No snapshots found. Run `routewatch capture` to create one.'));
      return;
    }
    console.log(chalk.bold('Saved snapshots:'));
    snapshots.forEach((s, i) => console.log(chalk.cyan(`  [${i + 1}] ${s}`)));
  });

program
  .command('inspect <filepath>')
  .description('Inspect a snapshot file')
  .action(async (filepath: string) => {
    try {
      const snap = await loadSnapshot(filepath);
      console.log(chalk.bold(`Snapshot created: ${snap.createdAt}`));
      console.log(chalk.bold(`Endpoints captured: ${snap.endpoints.length}`));
      snap.endpoints.forEach(ep => {
        const statusColor = ep.statusCode < 400 ? chalk.green : chalk.red;
        console.log(
          `  ${chalk.blue(ep.method.padEnd(7))} ${statusColor(String(ep.statusCode))} ${ep.url}`
        );
      });
    } catch (err) {
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

program.parse(process.argv);
