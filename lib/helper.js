const chalk = require("chalk");
const inquirer = require("inquirer");
const exec = require("child_process").execSync;
var random = require("lodash/random");
var fuzzy = require("fuzzy");
const dataFormat = function(data) {
  return data.list.reduce(
    ([names, git_urls], item) => {
      names.push(item.name);
      git_urls.push(item.git_url);
      return [names, git_urls];
    },
    [[], []]
  );
};

const searchCreator = function(states, values) {
  return function searchStates(answers, input) {
    input = input || "";
    return new Promise(function(resolve) {
      setTimeout(function() {
        var fuzzyResult = fuzzy.filter(input, states);
        resolve(
          fuzzyResult.map(function(el) {
            return {
              name: el.original,
              value: values[el.index]
            };
          })
        );
      }, random(30, 500));
    });
  };
};

const getGitUser = function() {
  let name;
  let email;

  try {
    name = exec("git config --get user.name");
    email = exec("git config --get user.email");
  } catch (e) {}

  name = name && JSON.stringify(name.toString().trim()).slice(1, -1);
  email = email && " <" + email.toString().trim() + ">";
  return (name || "") + (email || "");
};

/**
 * @returns {boolean}
 */
const hasYARN = function() {
  let yarn;
  let npm;
  try {
    yarn = exec("yarn -v");
    npm = exec("npm -v");
  } catch (e) {}
  yarn && console.log(`   yarn version ${yarn}`);
  npm && console.log(`   npm  version ${npm}`);
  return !!yarn;
};
module.exports = {
  searchCreator,
  dataFormat,
  getGitUser,
  hasYARN
};
