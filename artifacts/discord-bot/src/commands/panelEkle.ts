import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { getPanel, upsertPanel } from "../db.js";
import { refreshPanel } from "../ticket/manager.js";

export const data = new SlashCommandBuilder()
  .setName("panel-ekle")
  .setDescription("Ticket paneline yeni bir kategori ekler.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((opt) =>
    opt
      .setName("isim")
      .setDescription("Kategori adı (ör: Genel Destek)")
      .setRequired(true)
      .setMaxLength(50)
  )
  .addStringOption((opt) =>
    opt
      .setName("emoji")
      .setDescription("Kategori emojisi (ör: 🎫)")
      .setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;
  const isim = interaction.options.getString("isim", true).trim();
  const emoji = interaction.options.getString("emoji") ?? "";

  const panel = await getPanel(guildId);
  const categories = panel?.categories ?? [];

  if (categories.length >= 25) {
    await interaction.editReply("❌ Panelde en fazla 25 kategori olabilir.");
    return;
  }

  if (categories.some((c) => c.name === isim)) {
    await interaction.editReply(`❌ **${isim}** adlı kategori zaten mevcut.`);
    return;
  }

  categories.push({ name: isim, emoji, color: "Primary" });
  await upsertPanel(guildId, { categories });

  // Paneli yenile
  const updatedPanel = await getPanel(guildId);
  if (updatedPanel && interaction.guild) {
    await refreshPanel(interaction.guild, updatedPanel);
  }

  await interaction.editReply(
    `✅ **${emoji ? emoji + " " : ""}${isim}** kategorisi panele eklendi ve panel güncellendi!`
  );
}
