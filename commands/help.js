const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display help information about bot commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🚩 VortexOps CTF Bot - Command Help')
            .setDescription('A Discord bot for managing CTF events and challenges.')
            .addFields(
                {
                    name: '📋 CTF Management',
                    value: '**`/createctf`** - Create a new CTF workspace\n' +
                        'Creates a category with text, voice, and forum channels.\n' +
                        'Usage: `/createctf name:PicoCTF2024`\n\u200B',
                },
                {
                    name: '📝 Challenge Management',
                    value: '**`/createchallenge`** - Create a challenge forum post\n' +
                        'Creates a forum post with category, description, and template.\n' +
                        'Usage: `/createchallenge name:SQLi category:Web`\n' +
                        'Optional: `description:...` `url:...` `forum:...`\n\u200B',
                },
                {
                    name: '📦 Archiving',
                    value: '**`/archivectf`** - Archive a completed CTF workspace\n' +
                        'Locks channels and preserves content for reference.\n' +
                        'Usage: `/archivectf name:PicoCTF2024`\n\u200B',
                },
                {
                    name: '❓ Other Commands',
                    value: '**`/ping`** - Check if the bot is online\n' +
                        '**`/help`** - Display this help message\n\u200B',
                },
                {
                    name: '📚 Challenge Categories',
                    value: '🌐 Web • 🔐 Crypto • 🔍 Forensics • 🔄 Reversing\n' +
                        '🎲 Misc • 💥 Pwn • 🖼️ Stego • 📱 Mobile • 🕵️ OSINT',
                }
            )
            .setFooter({ text: 'Use slash commands by typing / in the chat' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
