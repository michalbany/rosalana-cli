const fs = require("fs");
const path = require("path");
const { resolvePath } = require('../utils/findFile');

function detectDependencies() {
  const projectPackageJsonPath = path.join(process.cwd(), 'package.json');
  let dependencies = {};
  let devDependencies = {};

  if (fs.existsSync(projectPackageJsonPath)) {
    const projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, 'utf8'));
    dependencies = projectPackageJson.dependencies || {};
    devDependencies = projectPackageJson.devDependencies || {};
  }

  const vite = dependencies['vite'] || devDependencies['vite'];
  const nuxt = dependencies['nuxt'] || devDependencies['nuxt'];
  const tailwindcss = dependencies['tailwindcss'] || devDependencies['tailwindcss'];
  const typescript = dependencies['typescript'] || devDependencies['typescript'];

  const framework = vite ? 'Vite' : nuxt ? 'Nuxt' : null;

  return {
    vite,
    nuxt,
    tailwindcss,
    typescript,
    framework,
  };
}

function detectMatch(config) {
  const dependencies = detectDependencies();

  let errors = [];

  if (dependencies.framework !== config.framework) {
    errors.push(`Framework mismatch!\n\nYour project is set up with ${dependencies.framework} but the configuration file is set up with ${config.framework}`);
  }

  if ((!dependencies.typescript && config.typescript) || (dependencies.typescript && !config.typescript)) {
    errors.push(`TypeScript mismatch!\n\nYour project is set up with ${dependencies.typescript ? 'TypeScript' : 'JavaScript'} but the configuration file is set up with ${config.typescript ? 'TypeScript' : 'JavaScript'}`);
  }

  return errors;

}

function detectExistence(config) {
  let errors = [];

  const appConfigPath = resolvePath(config.appConfigPath);
  const tsconfigPath = resolvePath(config.tsconfigPath)
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
