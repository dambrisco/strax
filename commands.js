function addCommand(commands, _aliases, helps, name, f, help, aliases) {
  commands.set(name, f);
  if (help) {
    helps.set(name, help);
  }
  if (aliases && Array.isArray(aliases) && aliases.length > 0) {
    for (var alias of aliases) {
      _aliases.set(alias, name);
    }
  }
}

function removeCommand(commands, aliases, helps, name) {
  commands.delete(name);
  if (helps.has(name)) {
    helps.delete(name);
  }
  for (var [alias, command] of aliases) {
    if (command === name) {
      aliases.delete(alias);
    }
  }
}

function runCommand(commands, aliases, command) {
  var f = () => false;
  if (commands.has(command.operation)) {
    f = commands.get(command.operation);
  } else if (aliases.has(command.operation)) {
    f = commands.get(aliases.get(command.operation));
  }
  return f(command.message, command.args, command.raw);
}

function getHelpText(commands, aliases, helps, leader, name) {
  if (name) {
    if (helps.has(name)) {
      return helps.get(name);
    } else if (aliases.has(name)) {
      return helps.get(aliases.get(name));
    }
  } else {
    return [...commands.keys()].reduce((text, command) => {
      text += '- `' + leader + command + '`';
      for (var [alias, _command] of aliases) {
        if (command === _command) {
          text += ', `' + leader + alias + '`';
        }
      }
      if (helps.has(command)) {
        text += ': ' + helps.get(command) + '\n';
      } else {
        text += '\n';
      }
      return text;
    }, '');
  }
}

module.exports = () => {
  var commands = new Map();
  var aliases = new Map();
  var helps = new Map();

  return {
    addCommand: addCommand.bind(null, commands, aliases, helps),
    removeCommand: removeCommand.bind(null, commands, aliases, helps),
    runCommand: runCommand.bind(null, commands, aliases),
    getHelpText: getHelpText.bind(null, commands, aliases, helps)
  };
};
