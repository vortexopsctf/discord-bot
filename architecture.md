# Architecture

A Discord bot designed to streamline CTF (Capture The Flag) communication and organization.

## Overview

The bot uses the Discord.js library to interact with the Discord API, providing automated CTF management capabilities through slash commands and event handling.

## Project Structure

### Bot Core
- **`index.js`** - Main bot file that initializes the client, loads commands and events, and handles interactions
- **`config.json`** - Configuration file containing bot token, client ID, and guild ID
- **`deploy-commands.js`** - Script to register slash commands with Discord

### Events
Event handlers are located in the `events/` directory. Each event exports:
- `name` - The event name to listen for
- `once` - Boolean indicating if the event should only fire once
- `execute` - Function to execute when the event fires

**Current Events:**
- `ready.js` - Fires when the bot successfully connects to Discord

### Commands
Slash commands are located in the `commands/` directory. Each command exports:
- `data` - SlashCommandBuilder instance defining the command structure
- `execute` - Async function to execute when the command is invoked

**Implemented Commands:**
- `/ping` - Simple health check that responds with "Pong!"
- `/createctf` - Create a complete CTF workspace with organized channels
- `/createchallenge` - Create a new forum post for a CTF challenge with category and template
- `/help` - Display help information about available bot commands
- `/archivectf` - Archive a completed CTF workspace
- `/addrole` - Assign CTF category roles to users (auto-creates role if missing)
- `/assign` - Assign a user to a challenge and track progress

**Command Details:**

#### `/addrole`
Assign a CTF category role (Web, Crypto, etc.) to a user.

**Parameters:**
- `user` (required) - The user to assign the role to
- `category` (required) - The CTF category role (select menu)

**Actions:**
- Checks if the role exists (e.g., "Web", "Crypto")
- Creates the role if it doesn't exist
- Assigns the role to the specified user
- Sends confirmation message

#### `/archivectf`
Archive a completed CTF workspace to preserve it while preventing new activity.

**Parameters:**
- `name` (required) - Name of the CTF to archive (autocomplete enabled)

**Actions:**
- Renames the category to `📦 Archived - [CTF Name]`
- Locks all channels in the category (removes send/post permissions for @everyone)
- Moves the category to the bottom of the channel list (lower position number)
- Sends a confirmation message with archive timestamp

**Benefits:**
- Preserves all CTF content (messages, forum posts, solutions)
- Prevents accidental new messages or posts
- Keeps past CTFs accessible for reference and learning
- Maintains organized server structure

#### `/createctf`
Create a complete CTF workspace with:
- Text channel for general discussion
- Voice channel for team communication
- Video channel for screen sharing
- Forum channel for challenge organization

**Parameters:**
- `name` (required) - Name of the CTF event

#### `/createchallenge`
Create a new forum post for a CTF challenge with a standardized template.

**Parameters:**
- `name` (required) - Name of the challenge
- `category` (required) - Challenge category (select menu)

**Category Options:**
- Web
- Crypto
- Forensics
- Reversing
- Misc
- Pwn
- Steganography
- Mobile
- OSINT

**Template Structure:**
```
Challenge: [Name]
Category: [Category]
Status: 🔴 Unsolved

## Description
[Challenge description]

## Notes
[Team notes and findings]

## Solution
[To be filled when solved]
```

#### `/assign`
Assign a user to a specific challenge and track their progress.

**Parameters:**
- `user` (required) - The user working on the challenge
- `challenge` (optional) - The challenge forum post (defaults to current thread)

**Actions:**
- Updates the main challenge post to list "Assigned Users"
- Adds the user to the thread (if not already added)
- Sends a confirmation message in the thread
- Updates the status tag to "In Progress" (if currently "Unsolved")

**Data Persistence:**
- Assignments are tracked directly in the challenge post content
- No external database required (uses Discord message as source of truth)

## Multi-CTF Support

The bot now supports managing multiple concurrent CTF events! The `/createchallenge` command includes an optional `forum` parameter with autocomplete, allowing you to select which CTF workspace to post challenges in.

**Usage:**
- Without forum parameter: Auto-detects the appropriate forum (backwards compatible)
- With forum parameter: Start typing the forum name and select from autocomplete

## Future Enhancements
- Challenge difficulty tracking
- Automatic team member notifications
