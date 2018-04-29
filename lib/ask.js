const chalk = require("chalk");
const promisify = require("util").promisify;
const inquirer = require("inquirer");
const exists = require("fs").existsSync;
const rimraf = promisify(require("rimraf"));
const logger = require("../lib/logger");
const {
  fetchRemote,
  loadConfig,
  scaffoldDownload,
  dcdDownload,
  initGitHook,
  overwritePkg,
  execInstallCmd
} = require("./api");
const { dataFormat, searchCreator, getGitUser, hasYARN } = require("./helper");
inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

const prompt = (...arg) => inquirer.prompt(...arg);

const author = getGitUser();
/**
 *
 * @param {string} rawName
 */
function dirExistsPrompt(rawName) {
  return exists(rawName)
    ? prompt([
        {
          type: "confirm",
          message: `Target directory ${chalk.yellow(
            rawName
          )} exists. Continue?`,
          name: "ok"
        }
      ]).then(
        ({ ok }) =>
          ok
            ? clearTargetDir(rawName)
            : Promise.reject(new Error("The program has dropped out!"))
      )
    : Promise.resolve();
}

function clearTargetDir(rawName) {
  logger.log(`${chalk.blue(`rimraf directory`)} ${chalk.yellow(rawName)}`);
  return rimraf(rawName);
}
/**
 * @param {Array} states
 * @param {Array} values
 */
function filterListPrompt([states, values]) {
  const search = searchCreator(states, values);
  logger.log(`fetch ${chalk.yellow(states.length)} messages!`);
  return prompt([
    {
      type: "autocomplete",
      message: `Already fetch ${chalk.yellow(
        states.length
      )} scaffolds from remote ... Choose one you like :)`,
      paginated: true,
      source: search,
      name: "url"
    }
  ]).then(({ url }) => formatGitUrl(url));
}

function scaffoldLoader() {
  return fetchRemote().then(res => dataFormat(res.data));
}

function clientLoader() {
  return Promise.resolve(loadConfig());
}

function askPrompt() {
  return prompt([
    {
      type: "list",
      message: "Which remote do you want?",
      choices: ["dcd", "scaffold"],
      default: "dcd",
      name: "select"
    }
  ]).then(
    ({ select }) => (select === "dcd" ? clientLoader() : scaffoldLoader())
  );
}
/**
 *
 * @param {string} url
 */
function formatGitUrl(url) {
  const regx = /github\.com\/(.+)\.git/;
  const res = url.match(regx);
  if (res && res[1]) {
    return {
      url: res[1],
      type: "scaffolds"
    };
  }
  return {
    url,
    type: "dcd"
  };
}
const taskType = {
  dcd: dcdDownload,
  scaffolds: scaffoldDownload
};
/**
 *
 * @param {string} rawName
 * @param {string} url
 * @param {string} type
 */
function downloadTask(rawName, { url, type }) {
  const task = taskType[type];
  return task(url, rawName)
    .then(() => initGitHook(rawName))
    .then(() => installPkg(rawName));
}

/**
 *
 * @param {string} rawName
 */
function overwritePkgTask(rawName) {
  const opts = {
    name: rawName.replace(/.*\//, ""),
    author,
  };
  return overwritePkg(rawName, opts);
}

/**
 *
 * @param {string} rawName
 */
function installPkg(rawName) {
  const tool = hasYARN() ? "yarn" : "npm";
  return execInstallCmd(tool, rawName);
}

function completed() {
  logger.say(author);
}
module.exports = {
  dirExistsPrompt,
  askPrompt,
  filterListPrompt,
  downloadTask,
  overwritePkgTask,
  completed
};
