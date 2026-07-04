import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { getPanel, upsertPanel } from "../db.js";
import { buildPanelEmbed, buildPanelRows } from "../ticket/manager.js";

export const data = new SlashCommandBuilder()
  .setName("panel-kur")
  .setDescription("Ticket panelini belirtilen kanala kurar.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((opt) =>
    opt
      .setName("kanal")
      .setDescription("Panelin gönderileceği kanal")
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.options.getChannel("kanal", true) as TextChannel;
  const guildId = interaction.guildId!;

  if (!channel.isTextBased()) {
    await interaction.editReply("❌ Lütfen bir yazı kanalı seçin.");
    return;
  }

  const existing = await getPanel(guildId);
  const categories = existing?.categories ?? [];

  const embed = buildPanelEmbed(categories);
  const rows = buildPanelRows(categories);

  // Eski panel mesajını sil
  if (existing?.channel_id && existing.message_id) {
    try {
      const oldChannel = interaction.guild!.channels.cache.get(
        existing.channel_id
      ) as TextChannel | undefined;
      if (oldChannel) {
        const oldMsg = await oldChannel.messages.fetch(existing.message_id).catch(() => null);
        if (oldMsg) await oldMsg.delete();
      }
    } catch {
      // eski mesaj silinemiyor, devam et
    }
  }

  const sent = await channel.send({ embeds: [embed], components: rows });

  await upsertPanel(guildId, {
    channel_id: channel.id,
    message_id: sent.id,
    categories,
  });

  await interaction.editReply(
    `✅ Ticket paneli ${channel} kanalına başarıyla kuruldu!`
  );
}
