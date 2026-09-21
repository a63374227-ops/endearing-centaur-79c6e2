require('dotenv').config();

const {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const token = process.env.TOKEN;

if (!token) {
  console.error('TOKEN is not set. Add it to the environment before starting the bot.');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot response time.'),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the available commands.'),
  new SlashCommandBuilder()
    .setName('about')
    .setDescription('Learn more about this bot.'),
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Show information about this server.')
].map(command => command.toJSON());

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, async readyClient => {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(Routes.applicationCommands(readyClient.user.id), {
      body: commands
    });

    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    console.log(`Registered ${commands.length} slash commands.`);
  } catch (error) {
    console.error('Failed to register slash commands:', error.message);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    if (interaction.commandName === 'ping') {
      await interaction.reply(`Pong! Latency: ${interaction.client.ws.ping}ms`);
      return;
    }

    if (interaction.commandName === 'help') {
      const helpEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Available Commands')
        .setDescription('Here are the commands you can use:')
        .addFields(
          { name: '/ping', value: 'Check the bot response time.' },
          { name: '/about', value: 'Learn more about this bot.' },
          { name: '/server', value: 'Show information about this server.' }
        )
        .setFooter({ text: 'Use a command by selecting it from the slash command menu.' });

      await interaction.reply({ embeds: [helpEmbed] });
      return;
    }

    if (interaction.commandName === 'about') {
      const aboutEmbed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('About This Bot')
        .setDescription('A modern Discord bot built with Discord.js.')
        .addFields(
          { name: 'Library', value: 'Discord.js v14', inline: true },
          { name: 'Commands', value: `${commands.length} slash commands`, inline: true }
        );

      await interaction.reply({ embeds: [aboutEmbed] });
      return;
    }

    if (interaction.commandName === 'server') {
      if (!interaction.guild) {
        await interaction.reply('This command can only be used inside a server.');
        return;
      }

      const serverEmbed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle(`${interaction.guild.name} Server Info`)
        .addFields(
          { name: 'Members', value: `${interaction.guild.memberCount}`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:D>`, inline: true }
        );

      await interaction.reply({ embeds: [serverEmbed] });
    }
  } catch (error) {
    console.error(`Command /${interaction.commandName} failed:`, error.message);

    const errorMessage = 'Something went wrong while running that command.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);

  // Give the process manager/host a chance to restart the bot
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

client.on("error", (error) => {
  console.error("❌ Discord Client Error:", error);
});

client.on("shardError", (error) => {
  console.error("❌ Discord Shard Error:", error);
});

if (!process.env.TOKEN) {
  console.error("❌ TOKEN is missing!");
  process.exit(1);
}

client.login(process.env.TOKEN).catch((error) => {
  console.error("❌ Login failed:", error);
  process.exit(1);
});