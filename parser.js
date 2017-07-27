function parse(leader, message) {
  var command = message.content.trim();
  var raw = command;
  if (!command.startsWith(leader)) {
    return Promise.reject(new Error('Not a command'));
  } else {
    var argsIndex = command.indexOf(' ');
    argsIndex = argsIndex >= 0 ? argsIndex - 1 : undefined;
    command = command.slice(leader.length);
    var operation = command.slice(0, argsIndex);
    var args = command.length === operation.length ?
      [] :
      command.slice(operation.length).split(' ').filter(s => s.length);
    return Promise.resolve({
      operation: operation,
      args: args,
      raw: raw,
      message: message
    });
  }
}

module.exports = leader => {
  return {
    parse: parse.bind(null, leader)
  };
};
