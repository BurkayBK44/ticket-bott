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
          "Ticket panelini belirttiğiniz kanala kurar. Panel üzerindeki butonlara tıklanarak ticket açılır.",
          "",
          "**`/panel-ekle`** `isim` `emoji`",
          "Panele yeni bir ticket kategorisi ekler. Örnek: *Genel Destek 🎫*, *Oyun Destek 🎮*. En fazla 25 kategori eklenebilir.",
          "",
          "**`/yetkili-rol`** `rol1` ... `rol9`",
          "Ticket yetkililerini belirler. Seçilen roller ticket kanallarını görebilir ve yönetebilir. 1 ile 9 arasında rol seçilebilir.",
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
          "Kapatma işlemi için onay istenir. Onaylandığında kanal silinir ve log kanalına kayıt gönderilir.",
          "",
          "**Üye ayrılırsa →** Açık ticketler otomatik kapatılır.",
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
