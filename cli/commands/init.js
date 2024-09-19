#!/usr/bin/env node
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const print = require("../utils/console");
const { detectDependencies } = require("../utils/detection");

async function initCommand() {
  // Zobrazení názvu
  print.title();

  // Zobrazení zprávy o inicializaci
  print.info("Initializing configuration file...");

  const dependencies = detectDependencies();

  // Dotazy na uživatele
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "components",
      message: "Where do you want to place components?",
      default: (dependencies) => {
        return dependencies.framework === "Nuxt"
          ? "./components/Rs"
          : "./src/components/Rs";
      },
    },
    {
      type: "input",
      name: "composables",
      message: "Where do you want to place composables?",
      default: (dependencies) => {
        return dependencies.framework === "Nuxt"
          ? "./composables/rs"
          : "./src/composables/rs";
      },
    },
    {
      type: "input",
      name: "types",
      message: "Where do you want to place types?",
      default: (dependencies) => {
        return dependencies.framework === "Nuxt"
          ? "./types/rs"
          : "./src/types/rs";
      },
    }
  ]);

  // Uložení konfigurace do souboru
  const configPath = path.resolve(process.cwd(), "rosalana.config.json");

  try {
    fs.writeFileSync(configPath, JSON.stringify({
      "rosalana-dev": "1.0.5",
      "paths": {
        ...answers
      },
      "installed": {
        "components": [],
        "composables": [],
      }
    }, null, 2));
  } catch (err) {
    // Zobrazení chyby při zápisu konfigurace
    print.error(`Writing configuration file: \n${err.message}`);
    process.exit(1);
  }

  // Zobrazení zprávy o úspěšném vytvoření konfigurace
  print.success(`Configuration file created at \n${configPath}`);

  // Informace o dalším kroku
  print.command("rosalana-dev install", "modify files in your project.");

  // Dotaz na okamžitou instalaci
  const installNow = await inquirer.prompt([
    {
      type: "confirm",
      name: "installNow",
      message: "Do you want to install now?",
      default: true,
    },
  ]);

  if (installNow.installNow) {
    require("./install")();
  }
}

module.exports = initCommand;
