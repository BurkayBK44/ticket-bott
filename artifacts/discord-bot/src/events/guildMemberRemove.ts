import { GuildMember, PartialGuildMember } from "discord.js";
import { handleMemberLeave } from "../ticket/manager.js";

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember
): Promise<void> {
  try {
    const guild = member.guild;
    const user = member.user;
    if (!user) return;

    console.log(`👋 Kullanıcı ayrıldı: ${user.tag} (${guild.name})`);
    await handleMemberLeave(guild, user);
  } catch (err) {
    console.error("Üye ayrılma hatası:", err);
  }
}
