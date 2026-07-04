import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("yeniden-basla")
  .setDescription("Botu yeniden başlatır. (Yalnızca yöneticiler)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle("🔄 Yeniden Başlatılıyor...")
    .setDescription("Bot yeniden başlatılıyor, birkaç saniye içinde geri döneceğim.")
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });

  console.log(`🔄 Yeniden başlatma isteği: ${interaction.user.tag}`);

  setTimeout(() => process.exit(0), 1000);
}
