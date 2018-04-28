const chalk = require("chalk");

const inquirer = require("inquirer");
const logger = require("../lib/logger");
const { fetchRemote } = require("./api");
const { dataFormat, searchCreator } = require("./helper");
inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);
function remoteLoader() {
  return fetchRemote()
    .then(res => {
      const [states, values] = dataFormat(res.data);
      const search = searchCreator(states, values);
      logger.log(`fetch ${chalk.yellow(states.length)} messages!`);
      return inquirer.prompt([
        {
          type: "autocomplete",
          message: `Already fetch ${chalk.yellow(
            states.length
          )} scaffolds from remote... Choose one you like :)`,
          paginated: true,
          source: search,
          name: "url"
        }
      ]);
    })
    .then(answer => {
      console.log(answer);
      return answer;
    });
}

function clientLoader() {

}
module.exports.ask = function() {
  return inquirer
    .prompt([
      {
        type: "list",
        message: "Which remote do you want?",
        choices: ["client", "remote"],
        default: "client",
        name: "select"
      }
    ])
    .then(({ select }) => {
      console.log(select);
      switch (select) {
        case "remote":
          return remoteLoader();
          break;
        case "client":
          return ;
          break;
        default:
          break;
      }
    });
};
