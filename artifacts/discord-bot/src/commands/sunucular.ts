import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("sunucular")
  .setDescription("Botun ekli olduğu sunucuları listeler. (Yalnızca yöneticiler)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const guilds = [...interaction.client.guilds.cache.values()];

  const liste = guilds
    .map((g, i) => `**${i + 1}.** ${g.name} — \`${g.memberCount} üye\``)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🌐 Botun Bulunduğu Sunucular (${guilds.size})`)
    .setDescription(liste || "Hiçbir sunucuda değil.")
    .setFooter({ text: "Bu mesaj yalnızca sana görünüyor." })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
