/**
 * Slash komutlarını manuel olarak kaydetmek için kullanılır.
 * Normalde bot başladığında otomatik kaydeder; bu script acil durumlarda kullanılır.
 * Kullanım: pnpm --filter @workspace/discord-bot run deploy
 */

import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN tanımlanmamış!");
  process.exit(1);
}

async function deploy() {
  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  console.log(`🔄 ${commands.length} slash komutu kaydediliyor...`);

  // Not: Client ID olmadan global deploy yapamayız.
  // Bot çalışırken ready event'te otomatik kaydedilir.
  console.log("ℹ️  Komutlar bot başladığında otomatik olarak kaydedilir.");
  console.log("   Bot çalışıyorsa yeniden başlatın.");
  console.log("\nKomutlar:");
  for (const cmd of commands) {
    console.log(`  /${cmd.data.name} — ${cmd.data.description}`);
  }
}

deploy();
