import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const CLIENT_ID = "1522965622194180096";
const PERMISSIONS = "268561424";
const INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${PERMISSIONS}&scope=bot%20applications.commands`;

export const data = new SlashCommandBuilder()
  .setName("davet")
  .setDescription("Botu sunucuna eklemek için davet linkini gönderir.");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🔗 Bot Davet Linki")
    .setDescription(
      `Botu kendi sunucuna eklemek için aşağıdaki bağlantıya tıkla:\n\n[👉 Sunucuna Ekle](${INVITE_URL})`
    )
    .setFooter({ text: "Bu mesaj yalnızca sana görünüyor." })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
