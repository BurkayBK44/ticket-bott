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
  .setName("sunucular")
  .setDescription("Botun ekli olduğu sunucuları listeler. (Yalnızca yetkililer)");

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
