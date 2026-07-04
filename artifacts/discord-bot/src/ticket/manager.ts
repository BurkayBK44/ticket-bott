import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  OverwriteType,
  PermissionFlagsBits,
  TextChannel,
  User,
} from "discord.js";
import {
  closeTicket,
  createTicket,
  getConfig,
  getPanel,
  getUserOpenTicket,
  getUserOpenTickets,
  PanelCategory,
  TicketPanel,
} from "../db.js";

// ─────────────────────────────────────────────
// Panel mesajı oluştur / güncelle
// ─────────────────────────────────────────────

export function buildPanelEmbed(categories: PanelCategory[]): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎫 Destek Merkezi")
    .setDescription(
      categories.length === 0
        ? "Henüz ticket kategorisi eklenmemiş.\n`/panel-ekle` komutuyla kategori ekleyin."
        : "Bir kategoriye tıklayarak destek talebi oluşturabilirsiniz.\n\nHer kullanıcının **aynı anda yalnızca 1 açık ticketi** olabilir."
    )
    .setFooter({ text: "Ticket Sistemi • Açık ticketiniz varsa önce kapatın." })
    .setTimestamp();
}

export function buildPanelRows(
  categories: PanelCategory[]
): ActionRowBuilder<ButtonBuilder>[] {
  if (categories.length === 0) return [];

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < categories.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const slice = categories.slice(i, i + 5);
    for (const cat of slice) {
      const btn = new ButtonBuilder()
        .setCustomId(`ticket_open:${cat.name}`)
        .setLabel(cat.name)
        .setStyle(ButtonStyle.Primary);
      if (cat.emoji) btn.setEmoji(cat.emoji);
      row.addComponents(btn);
    }
    rows.push(row);
  }
  return rows;
}

export async function refreshPanel(
  guild: Guild,
  panel: TicketPanel
): Promise<void> {
  if (!panel.channel_id) return;
  const channel = guild.channels.cache.get(panel.channel_id) as
    | TextChannel
    | undefined;
  if (!channel) return;

  const embed = buildPanelEmbed(panel.categories);
  const rows = buildPanelRows(panel.categories);

  if (panel.message_id) {
    try {
      const msg = await channel.messages.fetch(panel.message_id);
      await msg.edit({ embeds: [embed], components: rows });
      return;
    } catch {
      // Mesaj silinmişse yeniden gönder
    }
  }

  const sent = await channel.send({ embeds: [embed], components: rows });
  const { upsertPanel } = await import("../db.js");
  await upsertPanel(guild.id, { message_id: sent.id });
}

// ─────────────────────────────────────────────
// Ticket aç
// ─────────────────────────────────────────────

export async function openTicket(
  guild: Guild,
  member: GuildMember,
  category: string
): Promise<{ success: boolean; channelId?: string; error?: string }> {
  const existing = await getUserOpenTicket(guild.id, member.id);
  if (existing) {
    return {
      success: false,
      channelId: existing.channel_id,
      error: `Zaten açık bir ticketiniz var: <#${existing.channel_id}>\nYeni ticket açmak için önce mevcut ticketinizi kapatın.`,
    };
  }

  const config = await getConfig(guild.id);
  const authorizedRoles = config?.authorized_roles ?? [];

  // Kanal adı: ticket-kullanıcıadı
  const safeName = member.user.username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 20);
  const channelName = `ticket-${safeName}`;

  // İzin listesi
  const permissionOverwrites: {
    id: string;
    type: OverwriteType;
    allow?: bigint[];
    deny?: bigint[];
  }[] = [
    {
      id: guild.roles.everyone.id,
      type: OverwriteType.Role,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      type: OverwriteType.Member,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
  ];

  for (const roleId of authorizedRoles) {
    permissionOverwrites.push({
      id: roleId,
      type: OverwriteType.Role,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.AttachFiles,
      ],
    });
  }

  // "Ticketlar" kategorisini bul ya da oluştur
  let categoryChannel = guild.channels.cache.find(
    (c) => c.name === "Ticketlar" && c.type === ChannelType.GuildCategory
  );
  if (!categoryChannel) {
    categoryChannel = await guild.channels.create({
      name: "Ticketlar",
      type: ChannelType.GuildCategory,
    });
  }

  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryChannel.id,
    permissionOverwrites,
    topic: `${category} | ${member.user.tag} (${member.id})`,
  });

  const ticket = await createTicket(
    guild.id,
    member.id,
    ticketChannel.id,
    category
  );

  const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("🔒 Ticketi Kapat")
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`🎫 ${category}`)
    .setDescription(
      `Merhaba ${member}! Destek talebiniz oluşturuldu.\n\n` +
        `Bir yetkili en kısa sürede size yardımcı olacaktır.\n` +
        (authorizedRoles.length > 0
          ? `\n**Yetkililer:** ${authorizedRoles.map((r) => `<@&${r}>`).join(" ")}`
          : "")
    )
    .addFields(
      { name: "Kategori", value: category, inline: true },
      { name: "Ticket #", value: `#${ticket.id}`, inline: true },
      {
        name: "Açılış Tarihi",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true,
      }
    )
    .setFooter({ text: `Ticket sahibi: ${member.user.tag}` })
    .setTimestamp();

  await ticketChannel.send({
    content: `${member} ${authorizedRoles.map((r) => `<@&${r}>`).join(" ")}`,
    embeds: [embed],
    components: [closeRow],
  });

  // Log gönder
  await sendLog(guild, "open", {
    ticketId: ticket.id,
    userId: member.id,
    category,
    channelId: ticketChannel.id,
  });

  return { success: true, channelId: ticketChannel.id };
}

// ─────────────────────────────────────────────
// Ticket kapat
// ─────────────────────────────────────────────

export async function closeTicketByChannel(
  guild: Guild,
  channelId: string,
  closedBy: User
): Promise<{ success: boolean; error?: string }> {
  const channel = guild.channels.cache.get(channelId) as
    | TextChannel
    | undefined;
  if (!channel) return { success: false, error: "Kanal bulunamadı." };

  const ticket = await closeTicket(channelId, closedBy.id);
  if (!ticket) {
    return { success: false, error: "Bu kanalda açık bir ticket bulunamadı." };
  }

  // Transcript: son 100 mesajı al
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();
  const transcript = sorted
    .filter((m) => !m.author.bot || m.embeds.length === 0)
    .slice(0, 50)
    .map((m) => `[${m.author.tag}]: ${m.content || "(ek/embed)"}`)
    .join("\n");

  await sendLog(guild, "close", {
    ticketId: ticket.id,
    userId: ticket.user_id,
    category: ticket.category ?? "Bilinmiyor",
    channelId,
    closedBy: closedBy.id,
    transcript: transcript || "Mesaj bulunamadı.",
    createdAt: ticket.created_at,
  });

  // Kapatma mesajı gönder ve kanalı 3 saniye sonra sil
  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("🔒 Ticket Kapatıldı")
        .setDescription(
          `Ticket <@${closedBy.id}> tarafından kapatıldı.\nKanal 3 saniye içinde silinecek...`
        )
        .setTimestamp(),
    ],
  });

  setTimeout(async () => {
    try {
      await channel.delete("Ticket kapatıldı");
    } catch {
      // Kanal zaten silinmiş olabilir
    }
  }, 3000);

  return { success: true };
}

// ─────────────────────────────────────────────
// Log gönder
// ─────────────────────────────────────────────

interface LogOptions {
  ticketId: number;
  userId: string;
  category: string;
  channelId: string;
  closedBy?: string;
  transcript?: string;
  createdAt?: Date;
}

async function sendLog(
  guild: Guild,
  type: "open" | "close",
  opts: LogOptions
): Promise<void> {
  const config = await getConfig(guild.id);
  if (!config?.log_channel_id) return;

  const logChannel = guild.channels.cache.get(config.log_channel_id) as
    | TextChannel
    | undefined;
  if (!logChannel) return;

  if (type === "open") {
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("📂 Ticket Açıldı")
      .addFields(
        { name: "Ticket #", value: `#${opts.ticketId}`, inline: true },
        { name: "Kategori", value: opts.category, inline: true },
        { name: "Kullanıcı", value: `<@${opts.userId}>`, inline: true },
        { name: "Kanal", value: `<#${opts.channelId}>`, inline: true },
        {
          name: "Zaman",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true,
        }
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  } else {
    const duration = opts.createdAt
      ? Math.floor((Date.now() - opts.createdAt.getTime()) / 60000)
      : null;

    const transcriptTrimmed =
      opts.transcript && opts.transcript.length > 1000
        ? opts.transcript.slice(-1000) + "\n...(kısaltıldı)"
        : opts.transcript;

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("🔒 Ticket Kapatıldı")
      .addFields(
        { name: "Ticket #", value: `#${opts.ticketId}`, inline: true },
        { name: "Kategori", value: opts.category, inline: true },
        { name: "Kullanıcı", value: `<@${opts.userId}>`, inline: true },
        {
          name: "Kapatan",
          value: opts.closedBy ? `<@${opts.closedBy}>` : "Sistem",
          inline: true,
        },
        ...(duration !== null
          ? [{ name: "Süre", value: `${duration} dakika`, inline: true }]
          : []),
        ...(transcriptTrimmed
          ? [{ name: "📋 Transkript", value: `\`\`\`${transcriptTrimmed}\`\`\`` }]
          : [])
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  }
}

// ─────────────────────────────────────────────
// Üye ayrıldığında ticket(ları) kapat
// ─────────────────────────────────────────────

export async function handleMemberLeave(
  guild: Guild,
  user: User
): Promise<void> {
  const openTickets = await getUserOpenTickets(guild.id, user.id);
  for (const ticket of openTickets) {
    // DB kaydını her zaman kapat (kanal bulunamasa da)
    await closeTicket(ticket.channel_id, "sistem");

    await sendLog(guild, "close", {
      ticketId: ticket.id,
      userId: user.id,
      category: ticket.category ?? "Bilinmiyor",
      channelId: ticket.channel_id,
      closedBy: undefined,
      transcript: "Kullanıcı sunucudan ayrıldı.",
      createdAt: ticket.created_at,
    });

    // Kanal silme işlemi best-effort (önbelleğe bağlı)
    const channel = guild.channels.cache.get(ticket.channel_id);
    if (channel && channel.type === ChannelType.GuildText) {
      const textChannel = channel as TextChannel;
      try {
        await textChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xed4245)
              .setTitle("🚪 Kullanıcı Sunucudan Ayrıldı")
              .setDescription(
                `**${user.tag}** sunucudan ayrıldığı için ticket otomatik olarak kapatıldı.\nKanal 3 saniye içinde silinecek...`
              )
              .setTimestamp(),
          ],
        });
      } catch {
        // ignore
      }
      setTimeout(async () => {
        try {
          await textChannel.delete("Kullanıcı sunucudan ayrıldı");
        } catch {
          // ignore
        }
      }, 3000);
    }
  }
}
