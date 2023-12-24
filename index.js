const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

var mysql = require('mysql'),
    connection = mysql.createConnection({
      host: config.dbhost,
      user: config.dbuser,
      password: config.dbpass,
      database: config.dbname,
//      port: 3306
    }),
  headersOpt = { "content-type": "application/json" };


/* Send help message */
function help(message)
{
  var msg="```\n~help This command\n~myid Sends your discord id to be added at your profile\n~ping Check if the bot is alive\n~target [shortname] displays target details\n~user [username|profile_id] display user details```";
  return message.channel.send(msg);
}

/* LOOKUP user DETAILS FROM THE DATABASE (temporary) similar to target */
function user_lookup(message,username)
{
  var sql    = 'SELECT t2.id as profile_id,t1.username,t2.bio,t2.visibility,t2.avatar,t3.on_vpn, t3.on_pui,count(t4.target_id) as headshots,t5.id as rank, t6.points  FROM player AS t1 LEFT JOIN profile AS t2 on t2.player_id=t1.id LEFT JOIN player_last as t3 on t3.id=t1.id left join headshot as t4 on t4.player_id=t1.id LEFT JOIN player_rank as t5 on t5.player_id=t1.id LEFT JOIN player_score AS t6 on t6.player_id=t1.id where t1.active=1 and ( t1.username='+connection.escape(username)+' OR t2.id='+connection.escape(username)+') GROUP BY t1.id';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if(!results.length) return message.reply(`No user found with profile id or username ${username}`)
    let entry=results[0];
    if(entry.visibility==='private') return message.reply(`Cannot show details, the profile of ${username} is private.`);
    let memberembed = new Discord.RichEmbed()
     .setColor('#94c11f')
     .setTitle(entry.username)
     .setDescription(entry.bio)
     .setURL(`${config.baseURL}/profile/${entry.profile_id}`) // Their name, I use a different way, this should work
     .setThumbnail('${config.baseURL}/images/avatars/'+entry.avatar) // Their icon
     .addField('Rank',entry.rank,true)
     .addField('Points',entry.points,true)
     .addField('Headshots',entry.headshots,true);

    return message.channel.send(memberembed);
  });

}
/* LOOKUP TARGET DETAILS FROM THE DATABASE (temporary) */
function target_lookup(message,target)
{
  var sql    = 'SELECT t1.id,t1.name,t1.purpose, t1.description, t1.fqdn,inet_ntoa(t1.ip) as ip, count(distinct t2.id) as treasures, count(distinct t3.id) as findings,count(distinct t4.player_id) as headshots FROM target as t1 left join treasure as t2 on t2.target_id=t1.id LEFT JOIN finding as t3 on t3.target_id=t1.id LEFT JOIN headshot as t4 on t4.target_id=t1.id WHERE t1.active=1 and t1.name = ' + connection.escape(target)+' GROUP BY t1.id';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if(!results.length) return message.reply(`target ${target} not found.`)
    let memberembed = new Discord.RichEmbed()
     .setColor('#94c11f')
     .setTitle(results[0].fqdn+" "+results[0].ip+" ID#"+results[0].id)
     .setDescription(results[0].purpose)
     .setURL(`${config.baseURL}/target/${results[0].id}`) // Their name, I use a different way, this should work
     .setThumbnail('${config.baseURL}/images/targets/_'+results[0].name+'.png') // Their icon
     .addField('Flags/Services',results[0].treasures+' / '+results[0].findings,true)
     .addField('Headshots',results[0].headshots,true);
    return message.channel.send(memberembed);
  });
}


// Create an event listener for messages
client.on('message', message => {
  // if bot or not on #general then ignore
  if (message.author.bot) {
    return;
  }
  console.log(`#${message.channel.name} ${message.author.username}#${message.author.tag}> ${message.content}`);

  // if not start with our prefix then ignore
  if (!message.content.startsWith(config.prefix)) return;
  console.log(`processing command ${message.author.tag}`)

  const args = message.content.slice(config.prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  switch (command) {
    case 'purge':
      if (!message.member.hasPermission("ADMINISTRATOR"))
          return message.reply('only admins are allowed to perform this command!')
      const deleteCount = parseInt(args[0], 10);
      if(!deleteCount || deleteCount < 2 || deleteCount > 100)
        return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
      return message.channel.bulkDelete(deleteCount).catch(error => message.reply(`Couldn't delete messages because of: ${error}`));

    case 'say':
    if (!message.member.hasPermission("ADMINISTRATOR") && !member.roles.has(member.guild.roles.find(r => r.name.toLowerCase() === config.allowedRole.toLowerCase())))
        return message.reply('only admins are allowed to perform this command!')
      const sayMessage = args.join(" ");
      message.delete().catch(O_o=>{});
      return message.channel.send(sayMessage);

    case 'leave':
      if (!message.member.hasPermission("ADMINISTRATOR"))
          return message.reply('only admins are allowed to perform this command!');
      return client.guilds.get(message.guild.id).leave();

    case 'help':
      return help(message);

    case 'ping':
      return message.reply('pong');

    case 'myid':
        return message.reply(`Your userid is: ${message.author.id}`);

    case 'user':
      if (!args.length) {
  		    return message.reply(`You didn't provide any arguments, ${message.author}!`);
  	   }
       else {
         return user_lookup(message,args[0])
       }

    case 'target':
      if (!args.length) {
  		    return message.reply(`You didn't provide any arguments, ${message.author}!`);
  	   }
       else {
         return target_lookup(message,args[0])
       }
    default:
      return message.reply(`Have no idea what you meant there dude`);
  }
});

client.on('guildMemberRemove', member => {
  console.log(`member ${member.user.username} with id ${member} left :(`)
});

/**
 * Automatically assign role to new guild members
 */
client.on('guildMemberAdd', member => {
    console.log(`${member.user.username} with id ${member} has joined`);
    if (!member.roles.has(member.guild.roles.find(r => r.name === config.autoRole)))
    {
      member.addRole(member.guild.roles.find(r => r.name === config.autoRole));
      console.log(`added new member ${member} on ${config.autoRole}`);
    }
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    channel.send(`Welcome to the server, ${member}!`);
});

/**
 * When a player updates their status we check to ensure they have a role.
 * This is useful when the bot joins a server with already members without
 * proper roles.
 */
client.on("presenceUpdate", (oldMember, newMember) => {
    if(oldMember.presence.status !== newMember.presence.status){
        console.log(`${newMember.user.username} is now ${newMember.presence.status}`);
        if (!newMember.roles.has(oldMember.guild.roles.find(r => r.name === config.autoRole)))
        {
          console.log(`added new member ${member} on ${config.autoRole}`);
          newMember.addRole(oldMember.guild.roles.find(r => r.name === config.autoRole));
        }
    }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! ${config.defaultGuildID}`);
  client.user.setActivity(`${config.activityName}`);
  connection.connect(function(err) {
  });
});

client.login(config.token);
