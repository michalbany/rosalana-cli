#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const print = require('../../utils/console');
const { execSync } = require('child_process');
const { detectMatch, detectExistence } = require('../utils/detection');
const { resolvePath } = require('../utils/findFile');

async function installCommand() {
    // Zobrazení názvu
    print.title();

    // Zobrazení zprávy o instalaci
    print.info('Starting installation...');

    // načtení konfiguračního souboru
    const configPath = resolvePath('rosalana.config.json');
    let config;

    // čtení konfiguračního souboru
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        print.success('Configuration file loaded');
    } catch (error) {
        print.error('Configuration file not found');
        process.exit(1);
    }

    console.log(config);

    // Kontrola závislostí
    const mismatch = detectMatch(config);

    if (mismatch.length > 0) {
        mismatch.forEach((error) => {
            print.error(error);
        });
        process.exit(1);
    }

    const missing = detectExistence(config);

    if (missing.length > 0) {
        missing.forEach((file) => {
            print.warning(`File not found: ${file}\nIt is going to be created.`);
        });
    }


    print.success('Installation completed successfully!');
    print.command('rosalana-dev add <component>', 'add component to your project');

}

module.exports = installCommand;