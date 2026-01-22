const { SlashCommandBuilder, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addctfevent')
        .setDescription('Import a CTF event from CTFTime using its ID')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setDescription('The CTFTime Event ID (e.g. 3024)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const eventId = interaction.options.getInteger('id');
        await interaction.deferReply();

        try {
            // Fetch event data from CTFTime API
            // Using API v1 is more reliable than parsing .ics files
            const response = await fetch(`https://ctftime.org/api/v1/events/${eventId}/`, {
                headers: {
                    'User-Agent': 'VortexOps-Discord-Bot/1.0' // Good practice
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    await interaction.editReply({ content: `❌ Event ID **${eventId}** not found on CTFTime.` });
                } else {
                    await interaction.editReply({ content: `❌ Failed to fetch data from CTFTime (Status: ${response.status}).` });
                }
                return;
            }

            const data = await response.json();

            // Validate data
            if (!data.title || !data.start || !data.finish) {
                await interaction.editReply({ content: '❌ received incomplete data from CTFTime.' });
                return;
            }

            // Parse dates
            const startTime = new Date(data.start);
            const endTime = new Date(data.finish);

            // Ensure start time is in the future (Discord requirement for creation, usually)
            // But if importing past events, Discord might reject it.
            // We will proceed and let Discord handle the validation errors if it's in the past.

            // Prepare Image (Logo) if available
            let imageBuffer = null;
            if (data.logo) {
                try {
                    const imgRes = await fetch(data.logo);
                    if (imgRes.ok) {
                        const arrayBuffer = await imgRes.arrayBuffer();
                        imageBuffer = Buffer.from(arrayBuffer);
                    }
                } catch (e) {
                    console.warn('Failed to fetch event logo:', e);
                }
            }

            // Create Scheduled Event
            const event = await interaction.guild.scheduledEvents.create({
                name: data.title,
                scheduledStartTime: startTime,
                scheduledEndTime: endTime,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: GuildScheduledEventEntityType.External,
                entityMetadata: {
                    location: data.url || data.ctftime_url || 'https://ctftime.org' // External requires location
                },
                description: (data.description || 'No description').substring(0, 1000), // Discord limit
                image: imageBuffer
            });

            await interaction.editReply({
                content: `✅ Successfully created event: **${data.title}**\n` +
                    `📅 **Start:** <t:${Math.floor(startTime.getTime() / 1000)}:F>\n` +
                    `🔗 **Link:** [View Event](${event.url})`
            });

        } catch (error) {
            console.error('Error in addctfevent:', error);
            await interaction.editReply({
                content: `❌ Error creating event: ${error.message}`
            });
        }
    },
};
