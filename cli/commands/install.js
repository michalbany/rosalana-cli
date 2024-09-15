#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const print = require("../utils/console");
const { detectMatch, detectExistence } = require("../utils/detection");
const { resolvePath, createFiles } = require("../utils/files");

async function installCommand() {
  // Zobrazení názvu
  print.title();

  // Zobrazení zprávy o instalaci
  print.info("Starting installation...");

  // načtení konfiguračního souboru
  const configPath = resolvePath("rosalana.config.json");
  let config;

  // čtení konfiguračního souboru
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    print.success("Configuration file loaded");
  } catch (error) {
    print.error("Configuration file not found");
    print.command("rosalana-dev init", "initialize configuration file");
    process.exit(1);
  }

  // Kontrola závislostí
  const mismatch = await detectMatch(config);

  // Pokud se něco neshoduje zobrazí se chyba a nabídne se opětovná inicializace
  if (mismatch.length > 0) {
    mismatch.forEach((error) => {
      print.error(error);
    });

    const initAgain = await inquirer.prompt([
      {
        type: "confirm",
        name: "initAgain",
        message: "Would you like to initialize again?",
        default: true,
      },
    ]);

    if (initAgain.initAgain) {
      require("./init")();
    } else {
      print.error("Installation aborted!");
      process.exit(1);
    }
  } else {
    const missing = detectExistence(config);

    // Vytvoření souborů a složek
    if (missing.length > 0) {
      missing.forEach((file) => {
        try {
          createFiles(file);
          print.info(`Created: ${file}`);
        } catch (error) {
          print.error(`Creating file: ${file}\n${error.message}`);
          process.exit(1);
        }
      });
    }

    // Uprava konfigurace v cílovém projektu
    // - uprava tailwind.config.js
    // - uprava vite.config.js(ts) / nuxt.config.js(ts)
    // - uprava tsconfig.json / jsconfig.json
    // - uprava global css
    // - import global css to main file

    print.success("Installation completed successfully!");
    print.command(
      "rosalana-dev add <component>",
      "add component to your project"
    );
  }
}

module.exports = installCommand;
