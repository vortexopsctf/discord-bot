# VortexOps Discord Bot

A Discord bot to help with CTF communication.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the bot:**
   - Copy `config.json.sample` to `config.json`
   - Fill in your bot token, client ID, and guild ID
   - Get these values from the [Discord Developer Portal](https://discord.com/developers/applications)

3. **Deploy slash commands:**
   ```bash
   node deploy-commands.js
   ```

4. **Run the bot:**
   ```bash
   node index.js
   ```

## Project Structure

```
├── commands/         # Slash command files
│   └── ping.js      # Example ping command
├── events/          # Event handler files
│   └── ready.js     # Bot ready event
├── index.js         # Main bot file
├── deploy-commands.js  # Command deployment script
└── config.json      # Bot configuration (not in git)
```

## Adding Commands

Create a new file in the `commands/` folder:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    async execute(interaction) {
        await interaction.reply('Response!');
    },
};
```

After adding a command, run `node deploy-commands.js` to register it with Discord.

## Adding Events

Create a new file in the `events/` folder:

```javascript
module.exports = {
    name: 'eventName',
    once: false, // Set to true if this should only run once
    execute(arg1, arg2) {
        // Event handler code
    },
};
```

## Getting Bot Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section and click "Reset Token" to get your bot token
4. Your client ID is on the "General Information" page (Application ID)
5. To get your guild ID, enable Developer Mode in Discord (User Settings > Advanced), then right-click your server and click "Copy ID"
