#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const print = require("./console");

function resolvePath(resolvePath) {
  return path.resolve(process.cwd(), resolvePath);
}

function resolveLocalPath(resolvePath) {
  return path.resolve(__dirname, resolvePath);
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

  return filePath;
}

function writeSave(filePath, content) {
    try {
        let currentContent = '';

        // Pokud soubor existuje, načteme ho
        if (fs.existsSync(filePath)) {
            currentContent = fs.readFileSync(filePath, "utf8");

            // Pokud soubor už obsahuje požadovaný obsah, ukončíme funkci
            if (currentContent.includes(content)) {
                return;
            }

            // Pokud soubor obsahuje "export {};", odstraníme tento řádek
            if (currentContent.includes("export {};")) {
                currentContent = currentContent.replace(/export\s*\{\};\s*/, '');
            }
        }

        // Kontrola, jestli poslední znak je nový řádek
        const needsNewLine = currentContent.length > 0 && currentContent[currentContent.length - 1] !== "\n";
        
        // Připravíme nový obsah k přidání
        const finalContent = needsNewLine ? `\n${content}` : content;

        // Zápis aktualizovaného obsahu zpět do souboru
        fs.writeFileSync(filePath, currentContent + finalContent);
    } catch (error) {
        print.error(`Writing file: ${filePath}\n${error.message}`);
        process.exit(1);
    }
}


module.exports = { resolvePath, createFiles, writeSave, resolveLocalPath };
