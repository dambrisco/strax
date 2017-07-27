require('dotenv').load();
const Discord = require('discord.js');
const client = new Discord.Client();
const parser = require('./parser')(process.env.LEADER);
const filter = new RegExp(process.env.EXCLUDE_ROLES);
const timeout = require('./timeout');
const commands = require('./commands')();
const embedColor = 0x074877;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
  console.log(member.user.username + ' joined ' + member.guild.name + '!');
});

commands.addCommand('help', (message) => {
  var help = commands.getHelpText(process.env.LEADER);
  help = help.split('<leader>').join(process.env.LEADER);
  message.author.send({
    embed: {
      color: embedColor,
      title: 'Available Commands',
      description: help
    }
  });
  return true;
}, 'Display this text');

commands.addCommand('roles', (message) => {
  var roles = getSelfAssignableRoles(message);
  message.author.send({
    embed: {
      color: embedColor,
      title: message.guild.name + ' Roles',
      description:
        'These roles can be self-assigned using `.im` and `.imnot`',
      fields: [
        {
          name: 'Self-assignable Roles',
          value: roles.map(r => '- ' + r.name).join('\n') ||
            '*No roles available*'
        }
      ]
    }
  });
  return true;
}, 'List all self-assignable roles');

commands.addCommand('im', (message, args) => {
  var roles = getSelfAssignableRoles(message);
  var [success, role] =
    addRole(message.member, roles, args.join(' ').toLowerCase());
  if (success) {
    message.author.send('You\'ve been granted the `' + role.name + '` role!');
  } else {
    message.author.send('You couldn\'t be granted that role for some reason' +
      ' - check your spelling and make sure it\'s listed under `.roles`.');
  }
  return success;
}, 'Grant a self-assignable role');

commands.addCommand('imnot', (message, args) => {
  var roles = getSelfAssignableRoles(message);
  var [success, role] =
    removeRole(message.member, roles, args.join(' ').toLowerCase());
  if (success) {
    message.author.send('You\'ve removed the `' + role.name + '` role!');
  } else {
    message.author.send('That role couldn\'t be removed from you' +
      ' - check your spellling and make sure it\'s listed under `.roles`.');
  }
  return success;
}, 'Remove a self-assignable role');

commands.addCommand('map', (message, location) => {
  var urlLocation = location.join('+');
  var map = 'https://www.google.com/maps?q=' + urlLocation;
  var image = 'https://maps.googleapis.com/maps/api/staticmap' +
    '?zoom=14&size=500x300&maptype=roadmap&center=' + urlLocation +
    '&markers=color:red%7C' + urlLocation +
    '&key=' + process.env.GOOGLE_API_TOKEN;
  var embed = {
    embed: {
      color: embedColor,
      author: {
        name: message.member.displayName,
        icon_url: message.author.avatarURL
      },
      image: {
        url: image
      },
      fields: [
        {
          name: 'Location',
          value: map
        }
      ]
    }
  };
  message.channel.send(embed);
  return true;
}, 'Provides a static map image and google maps link for the given location');

client.on('message', message => {
  parser.parse(message).then(command => {
    var success = commands.runCommand(command);
    if (success) {
      message.react('👍');
    } else {
      message.react('👎');
    }
    if (message.deletable) {
      timeout(3000).then(() => message.delete());
    }
  }).catch(() => {
  });
});

function getSelfAssignableRoles(message) {
  var maxRole = client.guilds.get(message.guild.id).me.roles
    .reduce((max, role) =>
      role.position > max.position ? role : max, { position: -1 });
  return message.guild.roles.map(r => r)
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
