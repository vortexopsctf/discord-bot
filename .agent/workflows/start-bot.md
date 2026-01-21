---
description: Start the Discord bot
---

# Start the Discord Bot

Follow these steps to start the bot:

1. Ensure `config.json` is properly configured with your bot token, client ID, and guild ID

2. If you've added new commands, deploy them first:
```bash
npm run deploy
```

// turbo
3. Start the bot:
```bash
npm start
```

4. Verify the bot is online by checking the terminal output for "✅ Bot is online as [BotName]"

5. Test the bot in Discord by running a slash command like `/ping`
