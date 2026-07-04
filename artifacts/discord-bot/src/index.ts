import { Client, GatewayIntentBits, Partials } from "discord.js";
import { initDB } from "./db.js";
import { onReady } from "./events/ready.js";
import { onInteractionCreate } from "./events/interactionCreate.js";
import { onGuildMemberRemove } from "./events/guildMemberRemove.js";
import { onGuildCreate } from "./events/guildCreate.js";
import { onMessageCreate } from "./events/messageCreate.js";

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN tanımlanmamış!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember],
});

// ─── Veritabanını başlat ─────────────────────────────────────────────────────
console.log("🗄️  Veritabanı tabloları oluşturuluyor...");
initDB()
  .then(() => {
    console.log("✅ Veritabanı hazır.");
  })
  .catch((err) => {
    console.error("❌ Veritabanı hatası:", err);
    process.exit(1);
  });

// ─── Eventler ────────────────────────────────────────────────────────────────
client.once("clientReady", () => onReady(client));
client.on("interactionCreate", (interaction) =>
  onInteractionCreate(interaction).catch((err) =>
    console.error("interactionCreate hatası:", err)
  )
);
client.on("guildMemberRemove", (member) =>
  onGuildMemberRemove(member).catch((err) =>
    console.error("guildMemberRemove hatası:", err)
  )
);
client.on("guildCreate", (guild) =>
  onGuildCreate(guild).catch((err) =>
    console.error("guildCreate hatası:", err)
  )
);
client.on("messageCreate", (message) =>
  onMessageCreate(message).catch((err) =>
    console.error("messageCreate hatası:", err)
  )
);

// ─── Hata yakalama ───────────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("❌ İşlenmeyen hata:", err);
});

// ─── Discord'a bağlan ────────────────────────────────────────────────────────
console.log("🔄 Discord'a bağlanılıyor...");
client.login(process.env.DISCORD_BOT_TOKEN);
