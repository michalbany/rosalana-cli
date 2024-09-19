#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const print = require("../utils/console");
const {
  detectMatch,
  detectExistence,
  detectOrFix,
} = require("../utils/detection");
const { resolvePath, createFiles, writeSave } = require("../utils/files");

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
  await detectOrFix();

  // Pokud se něco neshoduje zobrazí vrátí se chyba
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

  const rootTSFolder = config.paths.types.substring(
    0,
    config.paths.types.lastIndexOf("/")
  );

  const moduleTSFile = path.join(config.paths.types, "index.ts");

  const indexTSPath = path.join(rootTSFolder, "index.ts");
  const indexTSContent = `export * from "./rs";\n`;
  const moduleTSContent = `export {};\n`;
  
  // Vytvoření obsahu pro index.ts
  writeSave(indexTSPath, indexTSContent);
  writeSave(moduleTSFile, moduleTSContent);


  print.success("Installation completed successfully!");
  print.command(
    "rosalana-dev add <component>",
    "add component to your project"
  );
}

module.exports = installCommand;
