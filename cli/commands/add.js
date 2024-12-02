#!/usr/bin/env node
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const print = require("../utils/console");
const {
  detectMatch,
  detectExistence,
  detectOrFix,
} = require("../utils/detection");
const { resolvePath, resolveLocalPath, createFiles, writeSave } = require("../utils/files");


async function addCommand(name) {
    // Zobrazení názvu
    print.title();

    // Zobrazení zprávy
    print.info(`Adding component: ${name}`);

    // načtení konfiguračního souboru
    const configPath = resolvePath("rosalana.config.json");
    let config;

    try {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (error) {
        print.error("Configuration file not found");
        print.command("rosalana-dev init", "initialize configuration file");
        process.exit(1);
    }

    // Načtení konfigurace komponenty
    const componentPath = resolveLocalPath(`../../components/${name}`);

    // Zjištění zda komponenta existuje
    if (!fs.existsSync(componentPath)) {
        print.error(`Component ${name} not found`);
        process.exit(1);
    }

    // načtení konfiguračního souboru komponenty
    const configComponentPath = path.join(componentPath, "config.json");
    let configComponent;

    try {
        configComponent = JSON.parse(fs.readFileSync(configComponentPath, "utf-8"));
    } catch (error) {
        print.error(`Component ${name} configuration file not found`);
        process.exit(1);
    }

    if (String(configComponent.name) !== String(name)) {
        print.error(`Component ${name} not found here`);
        process.exit(1);
    }

    let componentType = configComponent.type;

    if (!config.installed[componentType].includes(name)) {
        config.installed[componentType].push(name);
    } else {
        print.warning(`Component ${name} already added`);

        const wantsContinue = await inquirer.prompt([
            {
                type: "confirm",
                name: "continue",
                message: "Do you want to continue? Files will be overwritten",
                default: false,
            },
        ]);

        if (!wantsContinue.continue) {
            print.error("Operation canceled");
            process.exit(1);
        }
    }

    config['rosalana-dev'] = "1.0.13"

    // aktualizace konfigurace rosalana.config.json
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Vytvoření souborů v projektu
    const files = configComponent.files;
    
    files.forEach(file => {
        const filePath = resolvePath(config.paths[file.path]);
        const fileLocalPath = path.join(componentPath, file.name)

        try {
            createFiles(`${filePath}/${file.name}`);
            fs.copyFileSync(fileLocalPath, `${filePath}/${file.name}`);

            if (file.path === "types") {
                const moduleTSFile = path.join(config.paths.types, "index.ts");
                writeSave(moduleTSFile, `export * from "./${name}";\n`);
            }

        } catch (error) {
            print.error(`Creating file: ${filePath}\n${error.message}`);
            process.exit(1);
        }
    });

    print.success(`Component ${name} added successfully. Feel free to modify it for your needs.`);

    if (configComponent.warnings.length > 0) {
        configComponent.warnings.forEach(warning => {
            print.warning(warning);
        });
    }
}

module.exports = addCommand;