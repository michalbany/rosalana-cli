const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const { resolvePath } = require("./files");
const print = require("./console");
const { installTailwindCSS } = require("./installation");

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

  const vite = dependencies["vite"] || devDependencies["vite"];
  const nuxt = dependencies["nuxt"] || devDependencies["nuxt"];
  const tailwindcss =
    dependencies["tailwindcss"] || devDependencies["tailwindcss"];
  const typescript =
    dependencies["typescript"] || devDependencies["typescript"];

  const autoprefixer = dependencies["autoprefixer"] || devDependencies["autoprefixer"];

  const framework = vite ? "Vite" : nuxt ? "Nuxt" : null;

  return {
    vite,
    nuxt,
    tailwindcss,
    typescript,
    framework,
    autoprefixer
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
        message:
          "Package will be installed. Would you like to continue?",
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

  const appConfigPath = resolvePath(config.appConfigPath);
  const tsconfigPath = resolvePath(config.tsconfigPath);
  const globalCSSPath = resolvePath(config.globalCSS);
  const componentsDir = resolvePath(config.componentsDir);

  if (!fs.existsSync(appConfigPath)) {
    errors.push(config.appConfigPath);
  }

  if (!fs.existsSync(tsconfigPath)) {
    errors.push(config.tsconfigPath);
  }

  if (!fs.existsSync(globalCSSPath)) {
    errors.push(config.globalCSS);
  }

  if (!fs.existsSync(componentsDir)) {
    errors.push(config.componentsDir);
  }

  return errors;
}

module.exports = { detectDependencies, detectMatch, detectExistence };
