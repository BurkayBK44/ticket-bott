import { EmbedBuilder, Message } from "discord.js";

export async function onMessageCreate(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.mentions.has(message.client.user!.id)) return;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("👋 Merhaba! Ben TicketTure")
    .setDescription(
      "AYAHKN5 Youtube sunucusunun ticket botuyum. Aşağıdaki komutları kullanabilirsin:"
    )
    .addFields(
      {
        name: "⚙️ Kurulum Komutları",
        value: [
          "`/panel-kur` — Ticket panelini kanala kurar",
          "`/panel-ekle` — Panele yeni kategori ekler",
          "`/yetkili-rol` — Ticket yetkililerini ayarlar (1-9 rol)",
          "`/log-kanal` — Ticket log kanalını ayarlar",
        ].join("\n"),
      },
      {
        name: "🔗 Diğer Komutlar",
        value: [
          "`/yardim` — Tüm komutları gösterir",
          "`/davet` — Bot davet linkini gönderir",
          "`/sunucular` — Botun bulunduğu sunucuları listeler",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Daha fazla bilgi için /yardim komutunu kullanabilirsin." })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
