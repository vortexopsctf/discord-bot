const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign')
        .setDescription('Assign a user to a challenge')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to assign')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('challenge')
                .setDescription('The challenge thread (optional, defaults to current channel)')
                .addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread)
                .setRequired(false)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        let thread = interaction.options.getChannel('challenge');

        // If no channel provided, check if current channel is a thread
        if (!thread) {
            if (interaction.channel.isThread()) {
                thread = interaction.channel;
            } else {
                await interaction.reply({
                    content: '❌ Please specify a challenge thread or use this command inside a thread.',
                    ephemeral: true
                });
                return;
            }
        }

        // Verify it's a forum post (optional check, but good practice)
        if (thread.parent && thread.parent.type !== ChannelType.GuildForum) {
            await interaction.reply({
                content: '⚠️ Warning: This thread does not appear to be in a forum channel.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // 1. Add user to the thread
            await thread.members.add(targetUser.id);

            // 2. Fetch the starter message
            const starterMessage = await thread.fetchStarterMessage();

            if (starterMessage) {
                let content = starterMessage.content;

                // Check if "Assigned Users" section exists
                if (content.includes('**Assigned Users:**')) {
                    // Add user if not already present
                    if (!content.includes(targetUser.toString())) {
                        content = content.replace('**Assigned Users:**', `**Assigned Users:** ${targetUser} `);
                    }
                } else {
                    // Insert after Status line or at the top
                    if (content.includes('**Status:**')) {
                        content = content.replace(/\*\*Status:\*\*.*\n/, match => `${match}**Assigned Users:** ${targetUser}\n`);
                    } else {
                        content = `**Assigned Users:** ${targetUser}\n\n` + content;
                    }
                }

                // Update the message
                await starterMessage.edit(content);
            }

            // 3. Update Status Tag to "In Progress"
            if (thread.parent && thread.parent.type === ChannelType.GuildForum) {
                const inProgressTag = thread.parent.availableTags.find(t =>
                    t.name.toLowerCase() === 'in progress'
                );
                const unsolvedTag = thread.parent.availableTags.find(t =>
                    t.name.toLowerCase() === 'unsolved'
                );

                if (inProgressTag && unsolvedTag) {
                    // Remove 'Unsolved', Add 'In Progress', Keep others (Category)
                    const newTags = thread.appliedTags
                        .filter(tagId => tagId !== unsolvedTag.id) // Remove Unsolved
                        .concat(inProgressTag.id); // Add In Progress

                    // Remove duplicates
                    const uniqueTags = [...new Set(newTags)];

                    await thread.setAppliedTags(uniqueTags);
                }
            }

            await interaction.editReply({
                content: `✅ Assigned ${targetUser} to challenge **${thread.name}**!\n` +
                    `- Added to thread\n` +
                    `- Updated main post assignment list\n` +
                    `- Set status to "In Progress"`,
            });

        } catch (error) {
            console.error('Error assigning user:', error);
            await interaction.editReply({
                content: `❌ Error assigning user: ${error.message}`,
            });
        }
    },
};
