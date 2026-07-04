import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
} from "discord.js";
import { upsertConfig } from "../db.js";

export const data = new SlashCommandBuilder()
  .setName("yetkili-rol")
  .setDescription("Ticket yetkililerini ayarlar. 1 ile 9 arasında rol seçebilirsiniz.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption((opt) =>
    opt.setName("rol1").setDescription("1. yetkili rol").setRequired(true)
  )
  .addRoleOption((opt) =>
    opt.setName("rol2").setDescription("2. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol3").setDescription("3. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol4").setDescription("4. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol5").setDescription("5. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol6").setDescription("6. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol7").setDescription("7. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol8").setDescription("8. yetkili rol").setRequired(false)
  )
  .addRoleOption((opt) =>
    opt.setName("rol9").setDescription("9. yetkili rol").setRequired(false)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;
  const roles: Role[] = [];

  for (let i = 1; i <= 9; i++) {
    const role = interaction.options.getRole(`rol${i}`) as Role | null;
    if (role) roles.push(role);
  }

  // Benzersiz ID'ler
  const uniqueIds = [...new Set(roles.map((r) => r.id))];

  await upsertConfig(guildId, { authorized_roles: uniqueIds });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("✅ Yetkili Roller Güncellendi")
    .setDescription(
      `Ticket yetkilisi olarak **${uniqueIds.length}** rol ayarlandı:\n\n` +
        uniqueIds.map((id, i) => `${i + 1}. <@&${id}>`).join("\n")
    )
    .setFooter({
      text: "Bu roller ticket kanallarını görebilir ve yönetebilir.",
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
