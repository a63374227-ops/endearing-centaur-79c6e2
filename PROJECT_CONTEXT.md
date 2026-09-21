# Project Context

## Project Purpose

This project is a small Discord bot built with Discord.js v14. It connects to Discord using a token supplied through the local environment and provides English slash commands for basic bot and server information.

## Project Structure

```text
.
├── .env                # Local secret configuration; ignored by Git
├── .gitignore          # Excludes .env and node_modules/
├── index.js            # Bot entry point, command definitions, and handlers
├── package.json        # Project metadata, scripts, and direct dependencies
├── package-lock.json   # npm dependency lockfile
└── node_modules/       # Generated dependencies; recreated with npm install
```

The repository metadata in `.git/` is not part of the bot runtime. There are no source subdirectories, test files, or active documentation files. An unrelated HTML file was removed during project cleanup and is not required by the bot.

## Important Files

- `index.js` loads environment variables, creates the Discord client, registers slash commands, handles interactions, and logs in.
- `package.json` defines the `npm start` command and direct runtime dependencies.
- `package-lock.json` pins the complete npm dependency tree for repeatable installation.
- `.gitignore` prevents `.env` and `node_modules/` from being committed.
- `.env` is local-only configuration. Its contents are intentionally not documented here; it must contain a `TOKEN` environment variable supplied by the operator.

## Dependencies

Direct dependencies:

- `discord.js` `^14.27.0`: Discord client, slash-command builders, embeds, REST registration, and events.
- `dotenv` `^18.0.1`: Loads local `.env` values into `process.env`.

The exact installed transitive versions are controlled by `package-lock.json` and installed into `node_modules/`.

## Current Features

The bot registers four global slash commands when it becomes ready:

- `/ping`: Replies with `Pong!` and the WebSocket latency.
- `/help`: Shows an embed listing the available commands.
- `/about`: Shows bot/library information.
- `/server`: Shows the current server member count and creation date.

The bot uses only the `Guilds` gateway intent. It validates that `process.env.TOKEN` exists before starting, reports login and command-registration failures, sends a private fallback error when command handling fails after an interaction has started, and logs unhandled promise rejections, uncaught exceptions, Discord client errors, and shard errors. An uncaught exception schedules process exit after one second so a process manager or host can restart the bot.

## How Files Interact

1. `npm start` runs `node index.js` according to `package.json`.
2. `dotenv` loads the local `.env` file, and `index.js` reads `process.env.TOKEN`.
3. `index.js` creates a Discord client with the `Guilds` intent.
4. On the `ClientReady` event, the bot uses Discord REST endpoints to register the four global commands for the application.
5. On `InteractionCreate`, the bot identifies the command and sends the appropriate text or embed response.
6. Process and Discord client error listeners log runtime failures; uncaught exceptions exit after a short delay.
7. `package-lock.json` and npm rebuild `node_modules/` when dependencies are installed.

## How to Run

From the project root:

```bash
npm install
npm start
```

The local `.env` must provide a valid `TOKEN` before the bot can log in. Never commit, print, or share that value. Use Discord Developer Portal to revoke a token if it has been exposed and create a replacement.

## Important Configuration

- The required environment variable is `TOKEN`.
- The token is intentionally not hard-coded in `index.js` or this document.
- `.env` and `node_modules/` are ignored by Git.
- Slash commands are registered globally through `Routes.applicationCommands`, so Discord propagation can take time after changes.
- The bot requires a Discord application/bot configured in the Discord Developer Portal and invited to a server with the appropriate application command permissions.
- `package.json` targets the CommonJS `require` style; no `type` field is configured.

## Known Limitations

- Commands are registered globally, which is slower for development than guild-scoped registration.
- There is no persistent database, configuration schema, logging service, or test suite.
- The command set is defined in one file, so larger feature additions will make `index.js` harder to maintain.
- `/server` is useful only inside a Discord server and does not provide detailed moderation or permission checks.
- The bot does not include automatic retries, graceful shutdown handling, or deployment configuration. The uncaught-exception delay only gives an external process manager a restart opportunity; it is not a complete shutdown strategy.

## Future Features

- Split commands and event handlers into separate modules as the bot grows.
- Add guild-scoped development registration alongside global production registration.
- Add automated tests for command definitions and interaction behavior.
- Add structured logging and graceful shutdown handling.
- Add configurable moderation, utility, or server-management commands with explicit permission checks.
- Add deployment and process-management configuration only when a hosting target is selected.

## Maintenance Rule

Before making any future modification, read this document and the relevant source/configuration files. After a major modification, update this document so the structure, behavior, dependencies, and limitations remain accurate. Do not delete a project file without first checking its purpose and references.