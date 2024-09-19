const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const { resolvePath } = require("./files");
const print = require("./console");
const { installTailwindCSS, installTypeScript } = require("./installation");

function detectDependencies() {
  const projectPackageJsonPath = path.join(process.cwd(), "package.json");
  let dependencies = {};
  let devDependencies = {};

  if (fs.existsSync(projectPackageJsonPath)) {
    const projectPackageJson = JSON.parse(
      fs.readFileSync(projectPackageJsonPath, "utf8")
    );
    dependencies = projectPackageJson.dependencies || {};
    devDependencies = projectPackageJson.devDependencies || {};
  }

  const vue = dependencies["vue"] || devDependencies["vue"];
  const vite = dependencies["vite"] || devDependencies["vite"];
  const nuxt = dependencies["nuxt"] || devDependencies["nuxt"];
  const tailwindcss =
    dependencies["tailwindcss"] || devDependencies["tailwindcss"];
  const typescript =
    dependencies["typescript"] || devDependencies["typescript"];

  const autoprefixer =
    dependencies["autoprefixer"] || devDependencies["autoprefixer"];

  const framework = vite ? "Vite" : nuxt ? "Nuxt" : null;

  return {
    vite,
    nuxt,
    vue,
    tailwindcss,
    typescript,
    framework,
    autoprefixer,
  };
}

async function detectMatch(config) {
  const dependencies = detectDependencies();

  let errors = [];

  if (dependencies.framework !== config.framework) {
    errors.push(
      `Framework mismatch!\n\nYour project is set up with ${dependencies.framework} but the configuration file is set up with ${config.framework}`
    );
  }

  if (
    (!dependencies.typescript && config.typescript) ||
    (dependencies.typescript && !config.typescript)
  ) {
    errors.push(
      `TypeScript mismatch!\n\nYour project is set up with ${
        dependencies.typescript ? "TypeScript" : "JavaScript"
      } but the configuration file is set up with ${
        config.typescript ? "TypeScript" : "JavaScript"
      }`
    );
  }

  if (!dependencies.tailwindcss || !dependencies.autoprefixer) {
    print.error("Tailwind CSS or Autoprefixer not found in your project!");

    const installTailwindAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "installTailwind",
        message: "Package will be installed. Would you like to continue?",
        default: true,
      },
    ]);

    if (installTailwindAnswer.installTailwind) {
      installTailwindCSS();
    } else {
      print.error("Aborting installation...");
      process.exit(1);
    }
  }

  return errors;
}

function detectExistence(config) {
  let errors = [];

  const path = config.paths;

  if (!fs.existsSync(resolvePath(path.components))) {
    errors.push(path.components);
  }

  if (!fs.existsSync(resolvePath(path.composables))) {
    errors.push(path.composables);
  }

  if (!fs.existsSync(resolvePath(path.types))) {
    errors.push(path.types);
  }

  return errors;
}

async function detectOrFix() {
  const dependencies = detectDependencies();

  if (!dependencies.vue) {
    print.error(
      "Vue not found in your project!\n\nPlease install Vue before proceeding."
    );
  }

  if (!dependencies.typescript) {
    print.error("TypeScript not found in your project!");

    const installTypescriptAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "installTypescript",
        message: "Package will be installed. Would you like to continue?",
        default: true,
      },
    ]);

    if (installTypescriptAnswer.installTypescript) {
      installTypeScript();
    } else {
      print.error("Aborting installation...");
      process.exit(1);
    }
  }
}

module.exports = { detectDependencies, detectMatch, detectExistence, detectOrFix };
