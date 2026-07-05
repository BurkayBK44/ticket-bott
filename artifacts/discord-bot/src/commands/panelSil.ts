import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { getPanel, pool } from "../db.js";

export const data = new SlashCommandBuilder()
  .setName("panel-sil")
  .setDescription("Sunucudaki ticket panelini siler.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;
  const panel = await getPanel(guildId);

  if (!panel || (!panel.channel_id && !panel.message_id)) {
    await interaction.editReply("❌ Bu sunucuda kurulu bir panel bulunamadı.");
    return;
  }

  // Discord'daki panel mesajını sil
  if (panel.channel_id && panel.message_id) {
    try {
      const channel = await interaction.guild!.channels.fetch(panel.channel_id);
      if (channel?.isTextBased()) {
        const msg = await (channel as any).messages.fetch(panel.message_id);
        await msg.delete();
      }
    } catch {
      // Mesaj zaten silinmiş olabilir, devam et
    }
  }

  // Veritabanından paneli sil
  await pool.query("DELETE FROM ticket_panels WHERE guild_id = $1", [guildId]);

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("🗑️ Panel Silindi")
    .setDescription("Ticket paneli başarıyla silindi. Yeni bir panel kurmak için `/panel-kur` komutunu kullanabilirsiniz.")
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
