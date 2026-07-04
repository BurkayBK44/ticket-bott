import { Client, REST, Routes } from "discord.js";
import { commands } from "../commands/index.js";

export async function onReady(client: Client): Promise<void> {
  const tag = client.user?.tag ?? "Bilinmiyor";
  console.log(`✅ Bot hazır: ${tag}`);

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );
  const clientId = client.user!.id;
  const body = commands.map((cmd) => cmd.data.toJSON());

  // Her sunucuya özel kaydet (anında aktif olur)
  const guilds = client.guilds.cache;
  if (guilds.size === 0) {
    console.log("⚠️  Bot henüz hiçbir sunucuda değil.");
    return;
  }

  console.log(`🔄 ${commands.length} komut ${guilds.size} sunucuya kaydediliyor...`);
  let success = 0;
  for (const [guildId, guild] of guilds) {
    try {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
      console.log(`  ✅ ${guild.name}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${guild.name}:`, err);
    }
  }
  console.log(`✅ ${commands.length} slash komutu ${success}/${guilds.size} sunucuya kaydedildi.`);
}
