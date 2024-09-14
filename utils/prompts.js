const inquirer = require("inquirer");

async function promptUserForExistingProject(dependencies) {
  // Zde můžete přizpůsobit dotazy podle nalezených závislostí
  const answers = await inquirer.prompt([
    {
      name: "componentsDir",
      type: "input",
      message: "Where do you want to place components?",
      default: dependencies.vite
        ? "./src/components/Ui"
        : "./components/Ui",
    },
    {
      name: "baseColor",
      type: "list",
      message: "Which base color would you like to use?",
      choices: ["slate", "gray", "zinc", "neutral", "stone"],
      default: "slate",
    },
    {
      name: "tsconfigPath",
      type: "input",
      message: "Where is your tsconfig.json or jsconfig.json file?",
      default: dependencies.typescript
        ? "./tsconfig.json"
        : "./jsconfig.json",
    },
    {
      name: "globalCSS",
      type: "input",
      message: "Where is your global CSS file?",
      default: dependencies.vite
        ? "./src/assets/main.css"
        : "./assets/main.css",
    },
  ]);

  return answers;
}

async function promptUserForNewProject() {
  const freshProjectAnswers = await inquirer.prompt([
    {
      name: "appName",
      type: "input",
      message: "What is your application name?",
      default: "my-app",
    },
    {
      type: "list",
      name: "framework",
      message: "Which framework would you like to use?",
      choices: ["Vite", "Nuxt"],
      default: "Vite",
    },
    {
      name: "typeScript",
      type: "confirm",
      message: "Would you like to use TypeScript? (recommended)",
      default: true,
    },
  ]);

  return freshProjectAnswers;
}

module.exports = {
  promptUserForExistingProject,
  promptUserForNewProject,
};
