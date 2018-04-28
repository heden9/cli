const axios = require("axios");
const ora = require("ora");
const logger = require('../lib/logger');
const promisify = require('util').promisify;
const download = promisify(require("download-git-repo"));

function loadingEnhance(promise, config = {}) {
  const spinner = ora(config.text || "downloading...");
  spinner.start();
  return promise
    .then(res => {
      spinner.succeed("fetch success!");
      return res;
    })
    .catch(err => {
      spinner.fail("network error TnT");
      return err;
    });
}
module.exports.fetchRemote = function() {
  return loadingEnhance(axios.get("http://scaffold.ant.design/list.json"));
};
module.exports.downloadTmp = function(...arg) {
  return download(...arg)
    .catch(logger.fatal)
};
