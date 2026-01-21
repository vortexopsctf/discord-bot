const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { CHALLENGE_CATEGORIES } = require('../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createctf')
        .setDescription('Create a new CTF workspace with channels')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of the CTF event')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const ctfName = interaction.options.getString('name');
        const guild = interaction.guild;

        // Defer reply since channel creation may take time
        await interaction.deferReply();

        try {
            // Create category channel
            const category = await guild.channels.create({
                name: `🚩 ${ctfName}`,
                type: ChannelType.GuildCategory,
            });

            // Create text channel
            const textChannel = await guild.channels.create({
                name: `${ctfName}-general`,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `General discussion for ${ctfName}`,
            });

            // Create voice channel
            const voiceChannel = await guild.channels.create({
                name: `${ctfName}-voice`,
                type: ChannelType.GuildVoice,
                parent: category.id,
            });

            // Prepare forum tags from constants + status tags
            const tags = CHALLENGE_CATEGORIES.map(cat => {
                // Extract emoji from name (e.g., "🌐 Web" -> "🌐")
                const emoji = cat.name.split(' ')[0];
                const name = cat.value;
                return { name, emoji };
            });

            // Add status tags
            tags.push(
                { name: 'Solved', emoji: '✅' },
                { name: 'In Progress', emoji: '🔄' },
                { name: 'Unsolved', emoji: '�' }
            );

            // Create forum channel for challenges
            const forumChannel = await guild.channels.create({
                name: `${ctfName}-challenges`,
                type: ChannelType.GuildForum,
                parent: category.id,
                topic: `CTF challenges for ${ctfName}. Create a new post for each challenge using /createchallenge`,
                availableTags: tags,
            });

            // Send success message
            await interaction.editReply({
                content: `✅ Successfully created CTF workspace for **${ctfName}**!\n\n` +
                    `📝 Text: ${textChannel}\n` +
                    `🎤 Voice: ${voiceChannel}\n` +
                    `📋 Challenges: ${forumChannel}\n\n` +
                    `Use \`/createchallenge\` to add challenges to the forum!`,
            });

        } catch (error) {
            console.error('Error creating CTF workspace:', error);

            await interaction.editReply({
                content: '❌ There was an error creating the CTF workspace. Make sure the bot has the "Manage Channels" permission.',
            });
        }
    },
};
