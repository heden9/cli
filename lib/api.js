const chalk = require("chalk");
const axios = require("axios");
const ora = require("ora");
const logger = require("../lib/logger");
const path = require("path");
const promisify = require("util").promisify;
const execCommand = promisify(require("child_process").exec);
const spawn = require("child_process").spawn;
const download = promisify(require("download-git-repo"));
const writeFile = promisify(require("fs").writeFile);
function exec(...arg) {
  return execCommand(...arg).then(({ stdout, stderr }) => {
    console.log();
    stdout && logger.time(`${stdout}`);
    stderr && logger.time(`${stderr}`);
  });
}
function spawnKeepColor(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const chid = spawn(cmd, args, opts);

    chid.on("close", code => {
      logger.time(`completed ! ${code}`);
      resolve(code);
    });
  });
}
/**
 *
 * @param {Promise} promise
 * @param {Object} config
 * @returns {Promise}
 */
function loadingEnhance(promise, config = {}) {
  const spinner = ora("downloading...");
  spinner.start();
  return promise
    .then(res => {
      spinner.succeed(config.text || "fetch success!");
      return res;
    })
    .catch(err => {
      spinner.fail("network error TnT");
      logger.fatal(err);
    });
}
const fetchRemote = function() {
  return loadingEnhance(axios.get("http://scaffold.ant.design/list.json"));
};
const fetchConfig = function() {
  return loadingEnhance(
    axios.get(
      "https://raw.githubusercontent.com/w771854332/cli/master/config.json"
    )
    .then(e => e.data)
    .catch(e => require('../config'))
  )
};
const scaffoldDownload = function(...arg) {
  return loadingEnhance(download(...arg).catch(logger.fatal), {
    text: "download success 😊"
  });
};
/**
 *
 * @param {string} projectName
 * @param {string} rawName
 * @returns {Promise}
 */
const dcdDownload = function(projectName, rawName) {
  return loadingEnhance(exec(`git clone ${projectName} ${rawName}`), {
    text: "download success 😊"
  });
};
const loadConfig = function() {
  return fetchConfig().then((data) => {
    const { remotes } = data;
    return Object.keys(remotes).reduce(
      ([names, git_urls], key) => {
        names.push(key);
        git_urls.push(remotes[key]);
        return [names, git_urls];
      },
      [[], []]
    );
  });
};
// const loadConfig = function() {
//   const remotes = require("../config").remotes;
//   return Object.keys(remotes).reduce(
//     ([names, git_urls], key) => {
//       names.push(key);
//       git_urls.push(remotes[key]);
//       return [names, git_urls];
//     },
//     [[], []]
//   );
// };
/**
 *
 * @param {string} rawName
 * @returns {Promise}
 */
const initGitHook = function(rawName) {
  logger.time("init git_hooks....");
  return exec(
    "rm -rf .git && git init && scp gitr:hooks/commit-msg .git/hooks/",
    {
      cwd: rawName
    }
  );
};

/**
 * @param {string} rawName
 * @param {Object} opts
 */
function overwritePkg(rawName, opts) {
  const dir = path.join(process.cwd(), rawName, "package.json");
  const pkg = { ...require(dir), ...opts };
  return writeFile(dir, JSON.stringify(pkg), "utf8");
}

/**
 *
 * @param {string} tool
 * @param {string} rawName
 */
function execInstallCmd(tool, rawName) {
  console.log();
  console.log(`using ${chalk.yellow(tool)}`);
  console.log(chalk.yellow("Installing project dependencies ..."));
  return spawnKeepColor(`${tool}`, ["install"], {
    cwd: rawName,
    stdio: "inherit"
  });
}
module.exports = {
  fetchRemote,
  scaffoldDownload,
  dcdDownload,
  loadConfig,
  initGitHook,
  overwritePkg,
  execInstallCmd
};
