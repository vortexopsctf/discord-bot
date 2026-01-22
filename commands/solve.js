const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solve')
        .setDescription('Mark the current challenge as solved'),
    async execute(interaction) {
        // Ensure we are in a thread
        if (!interaction.channel.isThread()) {
            await interaction.reply({
                content: '❌ This command can only be used within a challenge thread.',
                ephemeral: true
            });
            return;
        }

        const thread = interaction.channel;
        const forumChannel = thread.parent;

        // Ensure parent is a forum channel
        if (forumChannel.type !== ChannelType.GuildForum) {
            await interaction.reply({
                content: '❌ This command can only be used in a forum thread.',
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply();

        try {
            // Get tags
            const solvedTag = forumChannel.availableTags.find(t => t.name.toLowerCase() === 'solved');
            const unsolvedTag = forumChannel.availableTags.find(t => t.name.toLowerCase() === 'unsolved');

            // Update tags: Remove Unsolved, Add Solved
            let newTags = thread.appliedTags;
            if (unsolvedTag) {
                newTags = newTags.filter(t => t !== unsolvedTag.id);
            }
            if (solvedTag && !newTags.includes(solvedTag.id)) {
                newTags.push(solvedTag.id);
            }

            // Update thread name and tags
            let newName = thread.name;
            if (!newName.includes('[SOLVED]')) {
                newName = `${newName} [SOLVED]`;
            }

            await thread.edit({
                name: newName,
                appliedTags: newTags
            });

            // Update the starter message
            const starterMessage = await thread.fetchStarterMessage();
            if (starterMessage) {
                let content = starterMessage.content;
                // Replace Status: 🔴 Unsolved with Status: 🟢 Solved
                content = content.replace('**Status:** 🔴 Unsolved', '**Status:** 🟢 Solved');

                // Also adding solution section helper text if it's "To be filled"
                if (content.includes('## 💡 Solution\n*To be filled when solved*')) {
                    content = content.replace(
                        '## 💡 Solution\n*To be filled when solved*',
                        `## 💡 Solution\nSolved by ${interaction.user.toString()}!`
                    );
                }


                if (content !== starterMessage.content) {
                    await starterMessage.edit(content);
                }
            }

            await interaction.editReply({
                content: `✅ Challenge marked as solved!`
            });

        } catch (error) {
            console.error('Error marking challenge as solved:', error);
            await interaction.editReply({
                content: '❌ An error occurred while trying to mark the challenge as solved.'
            });
        }
    },
};
