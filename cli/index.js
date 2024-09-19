#!/usr/bin/env node
const { Command } = require("commander");
const program = new Command();
const print = require("./utils/console");

// Commands
const initCommand = require("./commands/init");
const installCommand = require("./commands/install");
const addCommand = require("./commands/add");

program
  .name("rosalana-dev")
  .description(
    "Streamline your workflow with Rosalana composables. A simple CLI for sharing and managing pre-built components. For documentation, visit: https://dev.rosalana.co"
  )
  .version("1.0.0");

program
  .command("init")
  .description("Inicializate config for rosalana-dev")
  .action(initCommand);

program
  .command("install")
  .description("Install components")
  .action(installCommand);

program
  .command("add <component>")
  .description("Add component")
  .action(addCommand);

program
  .command("docs")
  .description("Show link to documentation or open it in your browser")
  .option("-o, --open", "Open documentation in the default browser")
  .action(async (options) => {
    if (options.open) {
      print.info("Opening documentation...");
      // Použití dynamického importu pro ESM modul
      const open = (await import("open")).default;
      open("https://dev.rosalana.co");
    } else {
      print.info("Documentation available at: https://dev.rosalana.co");
    }
  });

program.parse(process.argv);
