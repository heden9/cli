const chalk = require("chalk");

const inquirer = require("inquirer");
const logger = require("../lib/logger");
const { fetchRemote } = require("./api");
const { dataFormat, searchCreator } = require("./helper");
inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

module.exports.ask = function() {
  return inquirer
    .prompt([
      {
        type: "list",
        message: "What framework do you need?",
        choices: ["React", "Vue"],
        default: "React",
        name: "select"
      }
    ])
    .then(({ select }) => {
      console.log(select);
      switch (select) {
        case "React":
          return fetchRemote();
          break;

        default:
          break;
      }
    })
    .then(res => {
      const [states, values] = dataFormat(res.data);
      const search = searchCreator(states, values);
      logger.log(`fetch ${chalk.yellow(states.length)} messages!`);
      return inquirer
        .prompt([
          {
            type: "autocomplete",
            message:
              `Already fetch ${chalk.yellow(states.length)} scaffolds from remote... Choose one you like :)`,
            paginated: true,
            source: search,
            name: "select"
          }
        ])
    })
    .then(answer => {
      console.log(answer);
      return answer;
    });
};
