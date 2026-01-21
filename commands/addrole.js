const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CHALLENGE_CATEGORIES } = require('../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Assign a CTF category role to a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to assign the role to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('The CTF category role')
                .setRequired(true)
                .addChoices(...CHALLENGE_CATEGORIES)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const targetUser = interaction.options.getMember('user');
        const category = interaction.options.getString('category');

        if (!targetUser) {
            await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
            return;
        }

        await interaction.deferReply();

        try {
            // Check if role exists
            let role = interaction.guild.roles.cache.find(r => r.name === category);

            // Create role if it doesn't exist
            if (!role) {
                role = await interaction.guild.roles.create({
                    name: category,
                    reason: 'CTF Category Role created by bot',
                    mentionable: true,
                });
                console.log(`Created new role: ${category}`);
            }

            // Add role to user
            if (targetUser.roles.cache.has(role.id)) {
                await interaction.editReply({
                    content: `⚠️ ${targetUser} already has the **${role.name}** role.`,
                });
            } else {
                await targetUser.roles.add(role);
                await interaction.editReply({
                    content: `✅ Successfully assigned **${role.name}** role to ${targetUser}.`,
                });
            }

        } catch (error) {
            console.error('Error assigning role:', error);
            await interaction.editReply({
                content: '❌ Error assigning role. Please explicitly ensure the bot has permission to Manage Roles and that its role is ABOVE the roles it is trying to manage in the server settings.',
            });
        }
    },
};
