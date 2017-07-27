require('dotenv').load();
const Discord = require('discord.js');
const client = new Discord.Client();
const parser = require('./parser')(process.env.LEADER);
const filter = new RegExp(process.env.EXCLUDE_ROLES);
const timeout = require('./timeout');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  parser.parse(msg.content).then(command => {
    var maxRole = client.guilds.get(msg.guild.id).me.roles
      .reduce((max, role) =>
        role.position > max.position ? role : max, { position: -1 });
    var roles = getSelfAssignableRoles(msg.guild.roles, maxRole);
    var success = false, role = null;
    if (command.operation === 'roles') {
      msg.author.send({
        embed: {
          color: 0x074877,
          title: msg.guild.name + ' Roles',
          description:
            'These roles can be self-assigned using `.im` and `.imnot`',
          fields: [
            {
              name: 'Self-assignable Roles',
              value: roles.map(r => '- ' + r.name).join('\n')
            }
          ]
        }
      });
      success = true;
    } else if (command.operation === 'im') {
      [success, role] =
        addRole(msg.member, roles, command.args.join(' ').toLowerCase());
      msg.author.send('You\'ve been granted the `' + role.name + '` role!');
    } else if (command.operation === 'imnot') {
      [success, role] =
        removeRole(msg.member, roles, command.args.join(' ').toLowerCase());
      msg.author.send('You\'ve removed the `' + role.name + '` role!');
    }
    console.dir(command);
    if (success) {
      msg.react('👍');
    } else {
      msg.react('👎');
    }
    timeout(3000).then(() => msg.delete());
  }).catch(() => {
  });
});

function getSelfAssignableRoles(roles, maxRole) {
  return roles.map(r => r)
    .filter(r =>
      maxRole.position > r.position &&
      !filter.test(r.name) &&
      r.name !== '@everyone' &&
      !isManagementRole(r))
    .sort((a, b) => b.position - a.position);
}

function isManagementRole(role) {
  return role.hasPermission('MANAGE_NICKNAMES') ||
    role.hasPermission('MANAGE_ROLES') ||
    role.hasPermission('MANAGE_WEBHOOKS') ||
    role.hasPermission('MANAGE_EMOJIS') ||
    role.hasPermission('MANAGE_CHANNELS') ||
    role.hasPermission('MANAGE_GUILD') ||
    role.hasPermission('MANAGE_MESSAGES');
}

function addRole(member, roles, name) {
  var role = roles.find(r => r.name.toLowerCase().startsWith(name));
  if (role === undefined) {
    return [false, null];
  } else {
    member.addRole(role);
    return [true, role];
  }
}

function removeRole(member, roles, name) {
  var role = roles.find(r => r.name.toLowerCase().startsWith(name));
  if (role === undefined) {
    return [false, null];
  } else {
    member.removeRole(role);
    return [true, role];
  }
}

client.login(process.env.TOKEN);