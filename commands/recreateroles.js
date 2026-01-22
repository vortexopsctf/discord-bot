const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CHALLENGE_CATEGORIES } = require('../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recreateroles')
        .setDescription('Ensure all CTF category roles exist in the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        await interaction.deferReply();

        const createdRoles = [];
        const existingRoles = [];
        const errors = [];

        try {
            // Fetch all roles to ensure cache is up to date
            await interaction.guild.roles.fetch();

            for (const category of CHALLENGE_CATEGORIES) {
                const roleName = category.value; // keeping consistent with addrole.js which uses the value

                try {
                    let role = interaction.guild.roles.cache.find(r => r.name === roleName);

                    if (!role) {
                        role = await interaction.guild.roles.create({
                            name: roleName,
                            reason: 'CTF Category Role syncing',
                            mentionable: true,
                        });
                        createdRoles.push(roleName);
                        console.log(`[RecreateRoles] Created role: ${roleName}`);
                    } else {
                        existingRoles.push(roleName);
                    }
                } catch (err) {
                    console.error(`[RecreateRoles] Error processing role ${roleName}:`, err);
                    errors.push(`${roleName} (${err.message})`);
                }
            }

            let response = `## Role Sync Complete\n`;
            if (createdRoles.length > 0) {
                response += `✅ **Created ${createdRoles.length} Roles:** ${createdRoles.join(', ')}\n`;
            } else {
                response += `✅ **No new roles created.** All categories already have roles.\n`;
            }

            if (existingRoles.length > 0) {
                response += `ℹ️ **Existing Roles Checked:** ${existingRoles.length}\n`;
            }

            if (errors.length > 0) {
                response += `⚠️ **Errors:** \n${errors.join('\n')}\n`;
            }

            await interaction.editReply({ content: response });

        } catch (error) {
            console.error('Error in recreateroles:', error);
            await interaction.editReply({
                content: '❌ An unexpected error occurred while syncing roles.'
            });
        }
    },
};
