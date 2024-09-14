#!/usr/bin/env node
const { execSync } = require("child_process");
const inquirer = require("inquirer");
const chalk = require("chalk");
const boxen = require("boxen");
const { detectDependencies } = require("./utils/detection");
const {
  promptUserForExistingProject,
  promptUserForNewProject,
} = require("../utils/prompts");
const {
  installDependencies,
  installTailwindCSS,
  installTypeScript,
} = require("../utils/installation");
const fs = require("fs");
const path = require("path");

(async () => {
  // Základní příkazy CLI
  const args = process.argv.slice(2);

  if (args[0] === "init") {
    const dependencies = detectDependencies();

    // App is set up with Vite or Nuxt
    if (dependencies.vite || dependencies.nuxt) {
      console.log(
        boxen(
          chalk.green(`Detected the following in your project:
    - Framework: ${dependencies.vite ? "Vite" : "Nuxt"}
    - TypeScript: ${dependencies.typescript ? "Yes" : "No"}
    - Tailwind CSS: ${dependencies.tailwindcss ? "Yes" : "No"}`),
          { padding: 1, margin: 1, borderColor: "green", borderStyle: "double" }
        )
      );

      // Install Tailwind CSS
      if (!dependencies.tailwindcss) {
        const installTailwindAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "installTailwind",
            message:
              "Tailwind CSS is not installed. Package will be installed. Would you like to continue?",
            default: true,
          },
        ]);

        if (installTailwindAnswer.installTailwind) {
          installTailwindCSS();
          TWInstalled = true;
        } else {
          console.log(chalk.blue("Exiting..."));
          process.exit(0);
        }
      }

      // Install TypeScript
      if (!dependencies.typescript) {
        const installTypeScriptAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "installTypeScript",
            message: "Would you like to install TypeScript? (recommended)",
            default: true,
          },
        ]);

        if (installTypeScriptAnswer.installTypeScript) {
          installTypeScript();
          TSInstalled = true;
        }
      }

      // Pokračujeme s dotazy
      const answers = await promptUserForExistingProject(detectDependencies());

      // Vytvoření konfiguračního souboru
      fs.writeFileSync(
        path.join(process.cwd(), "rosalana.config.json"),
        JSON.stringify(
          {
            ...answers,
            framework: dependencies.isViteInstalled ? "Vite" : "Nuxt",
            typeScript: !!dependencies.isTypeScriptInstalled,
          },
          null,
          2
        )
      );
      console.log(
        boxen(chalk.green("Configuration complete."), {
          padding: 1,
          margin: 1,
          borderColor: "green",
          borderStyle: "double",
        })
      );

      // here change some files in the project
    } else {
      // Nenalezen existující project, nabídneme vytvoření nového
      console.warn(
        boxen(chalk.yellow("No Vite or Nuxt found in your project."), {
          padding: 1,
          margin: 1,
          borderColor: "yellow",
          borderStyle: "double",
        })
      );
    }
  }
})();

// } else if (args[0] === "add") {
//   const component = args[1];
//   const componentPath = path.resolve(
//     __dirname,
//     "..",
//     "components",
//     `${component}.vue`
//   );
//   const destPath = path.join(
//     process.cwd(),
//     "src",
//     "components",
//     `${component}.vue`
//   );

//   // Zkontroluj a vytvoř složky, pokud neexistují
//   const destDir = path.dirname(destPath);
//   if (!fs.existsSync(destDir)) {
//     fs.mkdirSync(destDir, { recursive: true }); // Vytvoří složky src/components, pokud neexistují
//   }

//   if (fs.existsSync(componentPath)) {
//     fs.copyFileSync(componentPath, destPath);
//     console.log(`${component} has been added to your project.`);
//   } else {
//     console.log(`Component ${component} does not exist.`);
//   }
// } else {
//   console.log("Usage: rosalana-dev init | rosalana-dev add <component>");
// }
