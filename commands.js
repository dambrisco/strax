function addCommand(commands, helps, name, f, help) {
  commands.set(name, f);
  if (help) {
    helps.set(name, help);
  }
}

function removeCommand(commands, helps, name) {
  commands.delete(name);
  helps.delete(name);
}

function runCommand(commands, command) {
  return commands.get(command.operation)(command.message, command.args,
    command.raw);
}

function getHelpText(helps, leader, name) {
  if (name) {
    return helps.get(name);
  } else {
    return [...helps.entries()].reduce((text, [command, help]) => {
      text += '- `' + leader + command + '`: ' + help + '\n';
      return text;
    }, '');
  }
}

module.exports = () => {
  var commands = new Map();
  var helps = new Map();

  return {
    addCommand: addCommand.bind(null, commands, helps),
    removeCommand: removeCommand.bind(null, commands, helps),
    runCommand: runCommand.bind(null, commands),
    getHelpText: getHelpText.bind(null, helps)
  };
};
