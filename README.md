# [WIP] echoCTF discord bot

A discord bot for providing information about your echoCTF server from your own discord server.

In order to user this bot you will have to register a bot account (follow the instructions here https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

## Supported Commands
The following bot commands are currently recognized
* `~help`: provides help
* `~myid`: (admin only) returns the discord id for the user to be used on the profile settings
* `~say`: (admin only) Make the bot say something
* `~purge [2-100]`: (admin only) Purge messages from the channel (eg `~purge 100`)
* `~leave`: (admin only) Leave the guild this command was received on
* `~user [username]`: Provide information about a given platform username (respecting the profile visibility setting of the user)
* `~target [name]`: Provide information about a platform target by shortname


## Configuration
The configuration file (`config.json`)should look something like
```json
{
	"prefix": "~",
	"allowedRole": "BUGHUNTER",
	"autoRole": "offense",
	"token": "<BOT TOKEN>",
	"dbhost": "localhost",
	"dbuser": "root",
	"dbpass": "",
	"dbname": "echoCTF",
	"defaultGuildID": "",
	"lastID": 0,
	"baseURL": "https://yoursite.com",
	"activityName": "myechoctf instance name"
}
```

The keys are self explanatory but in case it is not clear
* `prefix`: The prefix for the command eg `~` or `!`
* `allowedRole`: Roles that are allowed to send commands to the bot
* `autoRole`: Role to assign to new members of the guild
* `token`: Your token from discord developer portal
* `dbhost`: database host
* `dbuser`: database user
* `dbpass`: database password
* `dbname`: database name to use
