---
description: Initial setup for the Discord bot
---

# Discord Bot Setup

Follow these steps for initial bot setup:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a new application

2. Navigate to the "Bot" section and create a bot user

3. Under "Privileged Gateway Intents", enable:
   - Message Content Intent (if reading messages)
   - Server Members Intent (if needed)

4. Copy the bot token from the Bot section

5. Get your Application ID from the "General Information" page

6. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)

7. Right-click your server in Discord and click "Copy ID" to get your Guild ID

8. Copy `config.json.sample` to `config.json`:
```bash
copy config.json.sample config.json
```

9. Edit `config.json` and fill in your token, clientId, and guildId

10. Go to OAuth2 > URL Generator in the developer portal:
    - Select scopes: `bot` and `applications.commands`
    - Select permissions: `Manage Channels`, `Send Messages`, `Read Message History`
    - Copy the generated URL

11. Open the URL in your browser and invite the bot to your server

// turbo
12. Install dependencies (if not already done):
```bash
npm install
```

// turbo
13. Deploy the commands:
```bash
npm run deploy
```

// turbo
14. Start the bot:
```bash
npm start
```

15. Test with `/ping` in your Discord server
