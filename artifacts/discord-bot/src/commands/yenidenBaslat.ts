import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("yeniden-baslat")
  .setDescription("Botu yeniden başlatır. (Yalnızca yöneticiler)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle("🔄 Bot Yeniden Başlatılıyor")
        .setDescription("Bot birkaç saniye içinde yeniden başlayacak ve geri dönecek.")
        .setTimestamp(),
    ],
    ephemeral: true,
  });

  console.log(`🔄 Yeniden başlatma isteği: ${interaction.user.tag} (${interaction.guildId})`);

  setTimeout(() => process.exit(0), 1000);
}
