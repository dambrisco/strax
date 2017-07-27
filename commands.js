function addCommand(commands, name, f) {
  commands.set(name, f);
}

function removeCommand(commands, name) {
  commands.delete(name);
}

function runCommand(commands, command) {
  return commands.get(command.operation)(command.message, command.args,
    command.raw);
}

module.exports = () => {
  var commands = new Map();

  return {
    addCommand: addCommand.bind(null, commands),
    removeCommand: removeCommand.bind(null, commands),
    runCommand: runCommand.bind(null, commands)
  };
};
