import { Guild, REST, Routes } from "discord.js";
import { commands } from "../commands/index.js";

export async function onGuildCreate(guild: Guild): Promise<void> {
  console.log(`➕ Yeni sunucuya eklendi: ${guild.name} (${guild.id})`);

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  try {
    await rest.put(
      Routes.applicationGuildCommands(guild.client.user!.id, guild.id),
      { body: commands.map((cmd) => cmd.data.toJSON()) }
    );
    console.log(`✅ ${guild.name} sunucusuna ${commands.length} komut kaydedildi.`);
  } catch (err) {
    console.error(`❌ ${guild.name} komut kaydı başarısız:`, err);
  }
}
