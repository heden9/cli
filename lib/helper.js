const chalk = require("chalk");
const inquirer = require("inquirer");
var _ = require("lodash");
var fuzzy = require("fuzzy");
module.exports.dataFormat = function(data) {
  return data.list.reduce(
    ([names, git_urls], item) => {
      names.push(item.name);
      git_urls.push(item.git_url);
      return [names, git_urls];
    },
    [[], []]
  );
};

module.exports.searchCreator = function(states, values) {
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
      }, _.random(30, 500));
    });
  };
};
