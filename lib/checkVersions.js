const request = require("axios");
const semver = require("semver");
const chalk = require("chalk");
const logger = require("./logger");
const packageConfig = require("../package.json");
function checkNodeVersion() {
  if (!semver.satisfies(process.version, packageConfig.engines.node)) {
    logger.fatal(
      chalk.red(
        "  You must upgrade node to " +
          packageConfig.engines.node +
          " to use dcd-cli"
      )
    )``;
  }
}
function checkCliVersion() {
  return request({
    method: "get",
    url: "https://registry.npmjs.org/dcd-cli",
    timeout: 1000
  })
    .then(res => {
      const latestVersion = res.data["dist-tags"].latest;
      const localVersion = packageConfig.version;
      if (semver.lt(localVersion, latestVersion)) {
        console.log(chalk.yellow("  A newer version of dcd-cli is available."));
        console.log();
        console.log("  latest:    " + chalk.green(latestVersion));
        console.log("  installed: " + chalk.red(localVersion));
        console.log();
      }
    })
    .catch(err => {
      console.log(chalk.red(err));
      console.log(chalk.red("Failed to pull the latest version 😓"));
    });
}
module.exports = {
  checkCliVersion,
  checkNodeVersion
};
