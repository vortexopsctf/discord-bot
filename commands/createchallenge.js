const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { CHALLENGE_CATEGORIES } = require('../constants');
const { hedgedocUrl, hedgedocEmail, hedgedocPassword } = require('../config.json');

let cachedCookie = null;
let cookieExpiry = 0;

async function getHedgedocCookie(baseUrl) {
    if (cachedCookie && Date.now() < cookieExpiry) {
        return cachedCookie;
    }

    try {
        const params = new URLSearchParams();
        params.append('email', hedgedocEmail);
        params.append('password', hedgedocPassword);

        const response = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            body: params,
            redirect: 'manual' // We expect a redirect after login
        });

        // Get cookie from headers
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            // Simple extraction of connect.sid provided by HedgeDoc
            cachedCookie = setCookie.split(';')[0];
            cookieExpiry = Date.now() + (1000 * 60 * 60); // Cache for 1 hour
            return cachedCookie;
        }
    } catch (e) {
        console.error('HedgeDoc login failed:', e);
    }
    return null;
}

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
                .addChoices(...CHALLENGE_CATEGORIES)
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
        const focusedOption = interaction.options.getFocused(true);

        // Only handle autocomplete for 'forum' option
        if (focusedOption.name !== 'forum') return;

        const focusedValue = focusedOption.value;
        const guild = interaction.guild;

        // If not in a guild, return empty
        if (!guild) {
            await interaction.respond([]);
            return;
        }

        // Get all forum channels in the guild
        const forumChannels = guild.channels.cache.filter(
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

            // Try to create HedgeDoc note
            let noteUrl = null;
            if (hedgedocUrl && hedgedocEmail && hedgedocPassword) {
                try {
                    // remove trailing slash if present
                    const baseUrl = hedgedocUrl.replace(/\/$/, '');

                    const cookie = await getHedgedocCookie(baseUrl);

                    if (cookie) {
                        const noteBody = `---\ntags: ${category}, ctfnotes\n---\n# ${challengeName}\n**Category:** ${category}\n\n## Description\n${description}\n\n## Notes\n*Collaborative notes...*`;

                        const response = await fetch(`${baseUrl}/new`, {
                            method: 'POST',
                            body: noteBody,
                            headers: {
                                'Content-Type': 'text/markdown',
                                'Cookie': cookie
                            },
                            redirect: 'follow'
                        });

                        if (response.ok) {
                            noteUrl = response.url;
                            messageContent += `**📝 Collaborative Notes:** ${noteUrl}\n`;
                        } else {
                            console.error('Failed to create HedgeDoc note:', response.statusText);
                        }
                    } else {
                        console.error('Could not authenticate with HedgeDoc');
                    }

                } catch (err) {
                    console.error('Error creating HedgeDoc note:', err);
                }
            }

            if (url) {
                messageContent += `**URL:** ${url}\n`;
            }

            messageContent += `\n## 📝 Description\n${description}\n\n`;
            messageContent += `## 💡 Solution\n*To be filled when solved*\n`;

            // Auto-assign users based on role
            let assignedMembers = [];
            const role = interaction.guild.roles.cache.find(r => r.name === category);

            if (role) {
                // Determine members to assign
                assignedMembers = role.members.map(m => m);

                if (assignedMembers.length > 0) {
                    const mentions = assignedMembers.map(m => m.toString()).join(' ');
                    messageContent += `**Assigned Users:** ${mentions}\n`;
                }
            }

            // Create forum post (thread)
            const thread = await forumChannel.threads.create({
                name: `${category}: ${challengeName}`,
                message: { content: messageContent },
                appliedTags: tags,
            });

            // Add members to the thread
            if (assignedMembers.length > 0) {
                // Add members in parallel, catching errors to prevent crash
                await Promise.allSettled(assignedMembers.map(member =>
                    thread.members.add(member.id).catch(e => console.error(`Failed to add user ${member.user.tag}:`, e))
                ));
            }

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
