const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createchallenge')
        .setDescription('Create a new CTF challenge forum post')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of the challenge')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('Challenge category')
                .setRequired(true)
                .addChoices(
                    { name: '🌐 Web', value: 'Web' },
                    { name: '🔐 Crypto', value: 'Crypto' },
                    { name: '🔍 Forensics', value: 'Forensics' },
                    { name: '🔄 Reversing', value: 'Reversing' },
                    { name: '🎲 Misc', value: 'Misc' },
                    { name: '💥 Pwn', value: 'Pwn' },
                    { name: '🖼️ Steganography', value: 'Stego' },
                    { name: '📱 Mobile', value: 'Mobile' },
                    { name: '🕵️ OSINT', value: 'OSINT' }
                )
        )
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Challenge description (optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Challenge URL (optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('forum')
                .setDescription('Forum channel to post in (optional, auto-detects if not specified)')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        // Get all forum channels in the guild
        const forumChannels = interaction.guild.channels.cache.filter(
            channel => channel.type === ChannelType.GuildForum
        );

        // Filter and map to autocomplete choices
        const choices = forumChannels
            .filter(channel => channel.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .map(channel => ({
                name: channel.name,
                value: channel.id
            }))
            .slice(0, 25); // Discord limits to 25 choices

        await interaction.respond(choices);
    },
    async execute(interaction) {
        const challengeName = interaction.options.getString('name');
        const category = interaction.options.getString('category');
        const description = interaction.options.getString('description') || 'No description provided yet.';
        const url = interaction.options.getString('url');
        const forumId = interaction.options.getString('forum');

        // Defer reply since forum post creation may take time
        await interaction.deferReply({ ephemeral: true });

        try {
            let forumChannel;

            // If forum ID was provided, try to use it
            if (forumId) {
                forumChannel = interaction.guild.channels.cache.get(forumId);

                if (!forumChannel || forumChannel.type !== ChannelType.GuildForum) {
                    await interaction.editReply({
                        content: '❌ Selected channel is not a valid forum channel.',
                    });
                    return;
                }
            } else {
                // Auto-detect forum channel (original behavior)
                const forumChannels = interaction.guild.channels.cache.filter(
                    channel => channel.type === ChannelType.GuildForum
                );

                if (forumChannels.size === 0) {
                    await interaction.editReply({
                        content: '❌ No forum channels found! Please create a CTF workspace first using `/createctf`.',
                    });
                    return;
                }

                // Prefer forum channels with "challenge" in the name
                forumChannel = forumChannels.find(channel =>
                    channel.name.toLowerCase().includes('challenge')
                );

                // If no challenge forum found, use the first forum channel
                if (!forumChannel) {
                    forumChannel = forumChannels.first();
                }
            }

            // Find matching tag for the category
            const categoryTag = forumChannel.availableTags.find(tag =>
                tag.name.toLowerCase() === category.toLowerCase()
            );

            // Find "Unsolved" tag
            const unsolvedTag = forumChannel.availableTags.find(tag =>
                tag.name.toLowerCase() === 'unsolved'
            );

            // Prepare tags
            const tags = [];
            if (categoryTag) tags.push(categoryTag.id);
            if (unsolvedTag) tags.push(unsolvedTag.id);

            // Create the challenge template message
            let messageContent = `# Challenge: ${challengeName}\n\n`;
            messageContent += `**Category:** ${category}\n`;
            messageContent += `**Status:** 🔴 Unsolved\n`;

            if (url) {
                messageContent += `**URL:** ${url}\n`;
            }

            messageContent += `\n## 📝 Description\n${description}\n\n`;
            messageContent += `## 🔍 Notes\n*Team notes and findings go here...*\n\n`;
            messageContent += `## 💡 Solution\n*To be filled when solved*\n`;

            // Create forum post (thread)
            const thread = await forumChannel.threads.create({
                name: `${category}: ${challengeName}`,
                message: { content: messageContent },
                appliedTags: tags,
            });

            await interaction.editReply({
                content: `✅ Successfully created challenge: ${thread}\n\n` +
                    `**Name:** ${challengeName}\n` +
                    `**Category:** ${category}\n` +
                    `**Forum:** ${forumChannel}`,
            });

        } catch (error) {
            console.error('Error creating challenge:', error);

            await interaction.editReply({
                content: '❌ There was an error creating the challenge. Make sure the bot has permission to create posts in forum channels.',
            });
        }
    },
};
