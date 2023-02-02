import { Command } from 'commander';
import { generateAction } from './generator';

const program = new Command();

program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../../package.json').version);

program
    .command('generate')
    .option('-d, --destination <dir>', 'destination directory of generating')
    .requiredOption('-r, --root <dir>', 'source root folder')
    .option('-q, --quiet', 'whether the program should print something', false)
    .description('generates Java classes by Entity description')
    .action(generateAction);

program.parse(process.argv);