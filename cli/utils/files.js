#!/usr/bin/env node
const path = require("path");
const fs = require("fs");

function resolvePath(resolvePath) {
  return path.resolve(process.cwd(), resolvePath);
}

function createFiles(filePath) {
  const dirPath = path.dirname(filePath); // Získání cesty k adresáři

  // Vytvoření cílové složky, pokud neexistuje
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Kontrola, zda se jedná o soubor nebo složku
  if (path.extname(filePath)) {
    // Pokud má souborovou příponu, vytvořte soubor
    fs.writeFileSync(filePath, "");
  } else {
    // Pokud nemá souborovou příponu, vytvořte složku
    fs.mkdirSync(filePath, { recursive: true });
  }
}

module.exports = { resolvePath, createFiles };
