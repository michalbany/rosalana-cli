#!/usr/bin/env node
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const print = require("../utils/console");

async function initCommand() {
  // Zobrazení názvu
  print.title();

  // Zobrazení zprávy o inicializaci
  print.info("Initializing configuration file...");

  // Dotazy na uživatele
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "Which framework do you use?",
      choices: ["Vite", "Nuxt", "Laravel-Inertia"],
      default: "Vite",
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Do you want to use TypeScript? (Recommended)",
      default: true,
    },
    {
      type: "input",
      name: "componentsDir",
      message: "Where do you want to place components?",
      default: (answers) => {
        return answers.framework === "Vite"
          ? "./src/components/Ui"
          : "./components/Ui";
      },
    },
    {
      type: "list",
      name: "baseColor",
      message: "Which base color would you like to use?",
      choices: ["slate", "gray", "zinc", "neutral", "stone"],
      default: "slate",
    },
    {
      type: "input",
      name: "tsconfigPath",
      message: (answers) => {
        return `Where is your ${answers.typescript ? "tsconfig.json" : "jsconfig.json"} file?`;
      },
      default: (answers) => {
        return answers.typescript ? "./tsconfig.json" : "./jsconfig.json";
      },
    },
    {
      type: "input",
      name: "globalCSS",
      message: "Where is your global CSS file?",
      default: (answers) => {
        return answers.framework === "Vite"
          ? "./src/assets/tailwind.css"
          : "./assets/css/tailwind.css";
      },
    },
    {
      type: "input",
      name: "appConfigPath",
      message: (answers) => {
        return `Where is your ${answers.framework} config file?`;
      },
      default: (answers) => {
        return answers.framework === "Vite"
          ? `./vite.config${answers.typescript ? ".ts" : ".js"}`
          : `./nuxt.config${answers.typescript ? ".ts" : ".js"}`;
      },
    }
  ]);

  // Uložení konfigurace do souboru
  const configPath = path.resolve(process.cwd(), "rosalana.config.json");

  try {
    fs.writeFileSync(configPath, JSON.stringify(answers, null, 2));
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
