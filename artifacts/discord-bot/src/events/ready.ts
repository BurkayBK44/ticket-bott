import { Client, REST, Routes } from "discord.js";
import { commands } from "../commands/index.js";

export async function onReady(client: Client): Promise<void> {
  const tag = client.user?.tag ?? "Bilinmiyor";
  console.log(`✅ Bot hazır: ${tag}`);

  // Slash komutlarını global olarak kaydet
  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  try {
    console.log("🔄 Slash komutları kaydediliyor...");
    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: commands.map((cmd) => cmd.data.toJSON()),
    });
    console.log(`✅ ${commands.length} slash komutu başarıyla kaydedildi.`);
  } catch (err) {
    console.error("❌ Slash komutları kaydedilemedi:", err);
  }
}
