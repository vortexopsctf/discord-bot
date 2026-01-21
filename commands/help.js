const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CHALLENGE_CATEGORIES } = require('../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display help information about bot commands'),
    async execute(interaction) {
        const categoriesString = CHALLENGE_CATEGORIES
            .map(c => c.name)
            .join(' • ');

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🚩 VortexOps CTF Bot - Command Help')
            .setDescription('A Discord bot for managing CTF events and challenges.')
            .addFields(
                {
                    name: '📋 CTF Management',
                    value: '**`/createctf`** - Create a new CTF workspace\n' +
                        'Creates a category with text, voice, and forum channels.\n' +
                        'Usage: `/createctf name:PicoCTF2024`\n\n' +
                        '**`/archivectf`** - Archive a completed CTF workspace\n' +
                        'Locks channels and preserves content for reference.\n' +
                        'Usage: `/archivectf name:PicoCTF2024`\n\u200B',
                },
                {
                    name: '📝 Challenge Management',
                    value: '**`/createchallenge`** - Create a challenge forum post\n' +
                        'Creates a forum post with category, description, and template.\n' +
                        'Usage: `/createchallenge name:SQLi category:Web`\n\n' +
                        '**`/assign`** - Assign a user to a challenge\n' +
                        'Updates post and status tag to "In Progress".\n' +
                        'Usage: `/assign user:@username`\n\u200B',
                },
                {
                    name: '👥 User Management',
                    value: '**`/addrole`** - Assign CTF category role to user\n' +
                        'Auto-creates role if missing (e.g. Web, Crypto).\n' +
                        'Usage: `/addrole user:@username category:Web`\n\u200B',
                },
                {
                    name: '❓ Other Commands',
                    value: '**`/ping`** - Check if the bot is online\n' +
                        '**`/help`** - Display this help message\n\u200B',
                },
                {
                    name: '📚 Challenge Categories',
                    value: categoriesString,
                }
            )
            .setFooter({ text: 'Use slash commands by typing / in the chat' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
