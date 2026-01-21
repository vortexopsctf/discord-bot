---
description: Add a new slash command to the bot
---

# Add a New Slash Command

Follow these steps to add a new command:

1. Create a new file in the `commands/` directory named `<commandname>.js`

2. Use this template structure:
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

3. Add any required options to the command using `.addStringOption()`, `.addIntegerOption()`, etc.

4. Implement the command logic in the `execute` function

// turbo
5. Deploy the command to Discord:
```bash
npm run deploy
```

6. Test the command in Discord

7. Update `architecture.md` to document the new command in the "Implemented Commands" section
