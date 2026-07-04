import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { commands } from "./index.js";

export const data = new SlashCommandBuilder()
  .setName("reload")
  .setDescription("Slash komutlarını yeniden yükler. (Yalnızca yöneticiler)")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = interaction.client.user?.id;

  if (!token || !clientId) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle("❌ Hata")
          .setDescription("Bot token veya istemci kimliği alınamadı."),
      ],
    });
    return;
  }

  try {
    const rest = new REST({ version: "10" }).setToken(token);

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands.map((cmd) => cmd.data.toJSON()),
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle("✅ Komutlar Yeniden Yüklendi")
          .setDescription(
            `**${commands.length}** slash komutu başarıyla yeniden kaydedildi.`
          )
          .addFields({
            name: "Kayıtlı Komutlar",
            value: commands.map((c) => `\`/${c.data.name}\``).join(" · "),
          })
          .setTimestamp(),
      ],
    });
  } catch (err) {
    console.error("Reload hatası:", err);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle("❌ Yükleme Başarısız")
          .setDescription(
            "Komutlar yeniden yüklenirken bir hata oluştu. Konsol loglarını kontrol edin."
          ),
      ],
    });
  }
}
