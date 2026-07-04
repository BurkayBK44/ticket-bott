import { ActivityType, Client, REST, Routes } from "discord.js";
import { commands } from "../commands/index.js";

export async function onReady(client: Client): Promise<void> {
  const tag = client.user?.tag ?? "Bilinmiyor";
  console.log(`✅ Bot hazır: ${tag}`);

  client.user!.setPresence({
    activities: [
      {
        name: "Bu bot AYAHKN5 Youtube için kurulmuştur. Yardım için--> /yardim",
        type: ActivityType.Custom,
      },
    ],
    status: "online",
  });

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );
  const clientId = client.user!.id;
  const body = commands.map((cmd) => cmd.data.toJSON());

  // Global kaydet — tüm sunucularda geçerli olur (yayılma ~1 saat)
  try {
    console.log("🔄 Slash komutları global olarak kaydediliyor...");
    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log(`✅ ${commands.length} slash komutu global olarak kaydedildi.`);
  } catch (err) {
    console.error("❌ Slash komutları kaydedilemedi:", err);
  }
}
