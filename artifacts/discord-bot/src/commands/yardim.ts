import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("yardim")
  .setDescription("Tüm komutları ve açıklamalarını gösterir.");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📋 Komut Listesi")
    .setDescription("Aşağıda botun tüm komutları ve açıklamaları yer almaktadır.")
    .addFields(
      {
        name: "⚙️ Kurulum Komutları",
        value: [
          "**`/panel-kur`** `kanal`",
          "Ticket panelini belirttiğiniz kanala kurar.",
          "",
          "**`/panel-ekle`** `isim` `emoji`",
          "Panele yeni bir ticket kategorisi ekler. En fazla 25 kategori.",
          "",
          "**`/panel-sil`**",
          "Sunucudaki ticket panelini tamamen siler.",
          "",
          "**`/yetkili-rol`** `rol1` ... `rol9`",
          "Ticket yetkililerini belirler. 1 ile 9 arasında rol seçilebilir.",
          "",
          "**`/log-kanal`** `kanal`",
          "Ticket açılış ve kapanış loglarının gönderileceği kanalı ayarlar.",
        ].join("\n"),
      },
      {
        name: "🎫 Ticket Kullanımı",
        value: [
          "**Panel butonu →** Ticket açar.",
          "Her kullanıcı aynı anda yalnızca **1 açık ticket** açabilir.",
          "",
          "**🔒 Ticketi Kapat →** Ticket kanalı içindeki buton.",
          "Kapatma için onay istenir, onaylandığında kanal silinir ve log gönderilir.",
          "",
          "**Üye ayrılırsa →** Açık ticketler otomatik kapatılır.",
        ].join("\n"),
      },
      {
        name: "🔗 Diğer Komutlar",
        value: [
          "**`/davet`** — Botu başka bir sunucuya eklemek için davet linkini gönderir.",
          "**`/sunucular`** — Botun bulunduğu sunucuları listeler. (Yalnızca bot sahipleri)",
          "**`/yeniden-basla`** — Botu yeniden başlatır. (Yalnızca bot sahipleri)",
        ].join("\n"),
      },
      {
        name: "ℹ️ Bilgi",
        value: [
          "• Kurulum komutları yalnızca **Yöneticiler** tarafından kullanılabilir.",
          "• Ticket kanalları yalnızca ticket sahibi ve yetkili roller tarafından görülebilir.",
          "• Loglar, `/log-kanal` ile ayarlanan kanala otomatik gönderilir.",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Ticket Sistemi • Tüm işlemler Türkçe olarak yürütülür." })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
