const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('archivectf')
        .setDescription('Archive a completed CTF workspace')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of the CTF to archive')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        // Get all category channels (filter out archived ones)
        const categories = interaction.guild.channels.cache.filter(
            channel => channel.type === ChannelType.GuildCategory &&
                !channel.name.toLowerCase().includes('archived') &&
                channel.name.includes('🚩')
        );

        // Filter and map to autocomplete choices
        const choices = categories
            .filter(category => category.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .map(category => ({
                name: category.name,
                value: category.id
            }))
            .slice(0, 25);

        await interaction.respond(choices);
    },
    async execute(interaction) {
        const categoryId = interaction.options.getString('name');

        // Defer reply since archiving may take time
        await interaction.deferReply();

        try {
            // Get the category channel
            const category = interaction.guild.channels.cache.get(categoryId);

            if (!category || category.type !== ChannelType.GuildCategory) {
                await interaction.editReply({
                    content: '❌ Selected channel is not a valid category.',
                });
                return;
            }

            // Check if already archived
            if (category.name.toLowerCase().includes('archived')) {
                await interaction.editReply({
                    content: '❌ This CTF workspace is already archived!',
                });
                return;
            }

            // Get the original CTF name (remove emoji prefix)
            const originalName = category.name.replace('🚩', '').trim();
            const newName = `📦 Archived - ${originalName}`;

            // Get all channels in this category
            const channelsInCategory = interaction.guild.channels.cache.filter(
                channel => channel.parentId === category.id
            );

            // Lock all channels (remove send/post permissions for @everyone)
            let lockedCount = 0;
            for (const [, channel] of channelsInCategory) {
                try {
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false,
                    });
                    lockedCount++;
                } catch (error) {
                    console.error(`Error locking channel ${channel.name}:`, error);
                }
            }

            // Rename the category
            await category.setName(newName);

            // Move category to bottom (higher position number)
            const maxPosition = Math.max(
                ...interaction.guild.channels.cache
                    .filter(ch => ch.type === ChannelType.GuildCategory)
                    .map(ch => ch.position)
            );
            await category.setPosition(maxPosition);

            // Send confirmation
            await interaction.editReply({
                content: `✅ Successfully archived CTF workspace!\n\n` +
                    `**Category:** ${newName}\n` +
                    `**Channels Locked:** ${lockedCount}\n` +
                    `**Archived At:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                    `All channels have been locked. Content is preserved for reference.`,
            });

        } catch (error) {
            console.error('Error archiving CTF:', error);

            await interaction.editReply({
                content: '❌ There was an error archiving the CTF workspace. Make sure the bot has "Manage Channels" permission.',
            });
        }
    },
};
