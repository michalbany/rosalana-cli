const { execSync } = require("child_process");
const chalk = require("chalk");

function installDependencies() {
  console.log(chalk.blue("Installing project dependencies..."));
  execSync("npm install", { stdio: "inherit" });
}

function installTailwindCSS() {
  console.log(chalk.blue("Installing Tailwind CSS..."));
  execSync("npm install -D tailwindcss autoprefixer", { stdio: "inherit" });
  console.log(chalk.green("Tailwind CSS has been successfully installed."));
  console.log(chalk.blue("Initializing Tailwind CSS configuration..."));
  execSync("npx tailwindcss init -p", { stdio: "inherit" }); 
}

function installTypeScript() {
    console.log(chalk.blue("Installing TypeScript..."));
    execSync("npm install -D typescript", { stdio: "inherit" });
}

module.exports = {
  installDependencies,
  installTailwindCSS,
  installTypeScript
};
