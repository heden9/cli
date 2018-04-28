const axios = require("axios");
const ora = require("ora");
const logger = require("../lib/logger");
const promisify = require("util").promisify;
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
const fetchRemote = function() {
  return loadingEnhance(axios.get("http://scaffold.ant.design/list.json"));
};
const downloadTmp = function(...arg) {
  return download(...arg).catch(logger.fatal);
};
const loadConfig = function () {
  const remotes = require('../config').remotes;
  return Object.keys(remotes).map(key => ({
    name: key,
    value: remotes[key]
  }))
}
module.exports = {
  fetchRemote,
  downloadTmp,
  loadConfig
};
