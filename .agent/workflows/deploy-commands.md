---
description: Deploy slash commands to Discord
---

# Deploy Slash Commands

Follow these steps to deploy or update commands:

1. Ensure all command files in `commands/` directory are properly formatted

2. Verify `config.json` has the correct `clientId` and `guildId`

// turbo-all
3. Run the deployment script:
```bash
npm run deploy
```

4. Verify the output shows "Successfully reloaded X application (/) commands"

5. In Discord, type `/` to see the updated command list (may take a few seconds)

6. Test each new or updated command to ensure it works correctly

**Note:** If you want to deploy commands globally (all servers) instead of just one guild, modify `deploy-commands.js` to use `Routes.applicationCommands()` instead of `Routes.applicationGuildCommands()`. Global commands can take up to 1 hour to update.
