const chalk = require("chalk");
const format = require("util").format;

/**
 * Prefix.
 */

const { prefix } = require("../config");
const sep = chalk.gray("·");

exports.log = function(...args) {
  const msg = format.apply(format, args);
  console.log(chalk.white(prefix), sep, msg);
};

exports.fatal = function(...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim();
  const msg = format.apply(format, args);
  console.log();
  console.error(chalk.red(prefix), sep, msg);
  process.exit(1);
};

exports.say = function(user) {
  const hi = chalk.bold;
  console.log(
    hi(
      `
  ${chalk.green("Project completed!")}
  hi ~ ${chalk.blue(user)}
  just enjoy it 👻 !
`
    )
  );
};
exports.time = function(...args) {
  const time = `[${new Date().toLocaleString().split(" ")[1]}]`;
  const msg = format.apply(format, args);
  console.log(chalk.green(time), sep, msg);
};
