const { execSync } = require("child_process");
const chalk = require("chalk");
const print = require("./console");

function installDependencies() {
  console.log(chalk.blue("Installing project dependencies..."));
  execSync("npm install", { stdio: "inherit" });
}

function installTailwindCSS() {
  print.info("Installing Tailwind CSS...");
  try {
    execSync("npm install -D tailwindcss autoprefixer", { stdio: "inherit" });
    print.info("Initializing Tailwind CSS configuration...");
    print.success("Tailwind CSS has been successfully installed.");
    execSync("npx tailwindcss init -p", { stdio: "ignore" });
  } catch (error) {
    print.error("An error occurred while installing Tailwind CSS.\n", error);
  }
}

function installTypeScript() {
  print.info("Installing TypeScript...");
  try {
    execSync("npm install -D typescript", { stdio: "inherit" });
    print.success("TypeScript has been successfully installed.");
  } catch (error) {
    print.error("An error occurred while installing TypeScript.\n", error);
    process.exit(1);
  }
}

module.exports = {
  installDependencies,
  installTailwindCSS,
  installTypeScript,
};
