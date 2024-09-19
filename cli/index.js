#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();

// Commands
const initCommand = require('./commands/init');
const installCommand = require('./commands/install');
const addCommand = require('./commands/add');

program
    .name('rosalana-dev')
    .description('CLI tool for manage components')
    .version('1.0.0');

program
    .command('init')
    .description('Inicializate config for rosalana-dev')
    .action(initCommand);

program
    .command('install')
    .description('Install components')
    .action(installCommand);

program
    .command('add <component>')
    .description('Add component')
    .action(addCommand);
program.parse(process.argv);