import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { upsertConfig } from "../db.js";

export const data = new SlashCommandBuilder()
  .setName("log-kanal")
  .setDescription("Ticket loglarının gönderileceği kanalı ayarlar.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((opt) =>
    opt
      .setName("kanal")
      .setDescription("Log mesajlarının gönderileceği kanal")
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

  await upsertConfig(guildId, { log_channel_id: channel.id });

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ Log Kanalı Ayarlandı")
    .setDescription(
      `Ticket logları artık ${channel} kanalına gönderilecek.\n\n` +
        "Ticket açılış ve kapanışları bu kanalda takip edilebilir."
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
