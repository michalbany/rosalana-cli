const chalk = require("chalk");
const boxen = require("boxen");
const figlet = require("figlet");

const print = {
  title: function () {
    console.log(
      chalk.hex("#64C7FF")(
        figlet.textSync("Rosalana DEV", { horizontalLayout: "full" })
      )
    );
  },
  success: function (message) {
    console.log(
      boxen(chalk.hex("#0DD885")(`[OK] ${message}`), {
        padding: { top: 1, right: 5, bottom: 1, left: 1 },
        backgroundColor: "#002817",
        borderStyle: {
          topLeft: " ",
          topRight: " ",
          bottomRight: " ",
          bottomLeft: " ",
          vertical: " ",
          horizontal: " ",
        },
      })
    );
  },
  error: function (message) {
    console.log(
      boxen(chalk.hex("#FF3B10")(`[Error] ${message}`), {
        padding: { top: 1, right: 5, bottom: 1, left: 1 },
        backgroundColor: "#340A01",
        borderStyle: {
          topLeft: " ",
          topRight: " ",
          bottomRight: " ",
          bottomLeft: " ",
          vertical: " ",
          horizontal: " ",
        },
      })
    );
  },
  info: function (message) {
    console.log(
      boxen(chalk.hex("#64C7FF")(`[Info] ${message}`), {
        padding: { top: 1, right: 5, bottom: 1, left: 1 },
        backgroundColor: "#1A202C",
        borderStyle: {
          topLeft: " ",
          topRight: " ",
          bottomRight: " ",
          bottomLeft: " ",
          vertical: " ",
          horizontal: " ",
        },
      })
    );
  },
  warning: function (message) {
    console.log(
      boxen(chalk.hex("#FBCA05")(`[Warning] ${message}`), {
        padding: { top: 1, right: 5, bottom: 1, left: 1 },
        backgroundColor: "#292100",
        borderStyle: {
          topLeft: " ",
          topRight: " ",
          bottomRight: " ",
          bottomLeft: " ",
          vertical: " ",
          horizontal: " ",
        },
      })
    );
  },
  command: function (command, message) {
    console.log(
      chalk.hex("#64C7FF")(
        `You can run ${chalk.hex("0DD885")(command)} to ${message}\n`
      )
    );
  },
};

module.exports = print;
