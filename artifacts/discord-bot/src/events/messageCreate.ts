import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Message } from "discord.js";

const INVITE_URL = "https://discord.com/api/oauth2/authorize?client_id=1522965622194180096&permissions=268561424&scope=bot%20applications.commands";

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

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("🔗 Botu Sunucuna Ekle")
      .setStyle(ButtonStyle.Link)
      .setURL(INVITE_URL)
  );

  await message.reply({ embeds: [embed], components: [row] });
}
