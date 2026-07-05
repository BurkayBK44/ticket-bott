import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const YETKİLİ_IDS = [
  "1433498247313227886",
  "1063424847247577098",
  "1445487686533251163",
];

export const data = new SlashCommandBuilder()
  .setName("yeniden-basla")
  .setDescription("Botu yeniden başlatır. (Yalnızca yetkililer)");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (!YETKİLİ_IDS.includes(interaction.user.id)) {
    await interaction.reply({
      content: "❌ Bu komutu kullanma yetkin yok.",
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle("🔄 Yeniden Başlatılıyor...")
    .setDescription("Bot yeniden başlatılıyor, birkaç saniye içinde geri döneceğim.")
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
  console.log(`🔄 Yeniden başlatma isteği: ${interaction.user.tag}`);
  setTimeout(() => process.exit(0), 1000);
}
