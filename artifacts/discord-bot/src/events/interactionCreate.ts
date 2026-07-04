import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Interaction,
} from "discord.js";
import { commandMap } from "../commands/index.js";
import {
  closeTicketByChannel,
  openTicket,
} from "../ticket/manager.js";

export async function onInteractionCreate(
  interaction: Interaction
): Promise<void> {
  // ─── Slash komutları ───────────────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const command = commandMap.get(interaction.commandName);
    if (!command) {
      await (interaction as ChatInputCommandInteraction).reply({
        content: "❌ Bu komut bulunamadı.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.guildId) {
      await interaction.reply({
        content: "❌ Bu komut yalnızca sunucularda kullanılabilir.",
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (err) {
      console.error(`Komut hatası [${interaction.commandName}]:`, err);
      const msg = { content: "❌ Komut çalıştırılırken bir hata oluştu.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
    return;
  }

  // ─── Buton etkileşimleri ──────────────────────────────────────────────
  if (interaction.isButton()) {
    const btn = interaction as ButtonInteraction;

    if (!btn.guildId || !btn.guild || !btn.member) {
      await btn.reply({ content: "❌ Sunucu bilgisi alınamadı.", ephemeral: true });
      return;
    }

    const { customId } = btn;

    // Ticket aç: ticket_open:{category}
    if (customId.startsWith("ticket_open:")) {
      const category = customId.slice("ticket_open:".length);
      await btn.deferReply({ ephemeral: true });

      try {
        const result = await openTicket(
          btn.guild,
          await btn.guild.members.fetch(btn.user.id),
          category
        );

        if (!result.success) {
          await btn.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xed4245)
                .setTitle("❌ Ticket Açılamadı")
                .setDescription(result.error ?? "Bilinmeyen bir hata oluştu."),
            ],
          });
          return;
        }

        await btn.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x57f287)
              .setTitle("✅ Ticket Oluşturuldu")
              .setDescription(
                `Ticket kanalınız oluşturuldu: <#${result.channelId}>`
              ),
          ],
        });
      } catch (err) {
        console.error("Ticket açma hatası:", err);
        await btn.editReply({
          content: "❌ Ticket açılırken bir hata oluştu. Lütfen tekrar deneyin.",
        }).catch(() => {});
      }
      return;
    }

    // Ticket kapat: ticket_close (kanal içinden)
    if (customId === "ticket_close") {
      const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_confirm_close")
          .setLabel("✅ Evet, Kapat")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("ticket_cancel_close")
          .setLabel("❌ İptal")
          .setStyle(ButtonStyle.Secondary)
      );

      await btn.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xfee75c)
            .setTitle("⚠️ Ticketi Kapat")
            .setDescription(
              "Bu ticketi kapatmak istediğinize emin misiniz?\nKapatıldıktan sonra kanal silinecektir."
            ),
        ],
        components: [confirmRow],
        ephemeral: true,
      });
      return;
    }

    // Kapama onayı
    if (customId === "ticket_confirm_close") {
      await btn.deferUpdate();

      try {
        const result = await closeTicketByChannel(
          btn.guild,
          btn.channelId,
          btn.user
        );

        if (!result.success) {
          await btn.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xed4245)
                .setTitle("❌ Hata")
                .setDescription(result.error ?? "Ticket kapatılamadı."),
            ],
            components: [],
          });
          return;
        }

        await btn.editReply({ content: "✅ Ticket kapatılıyor...", embeds: [], components: [] }).catch(() => {});
      } catch (err) {
        console.error("Ticket kapatma hatası:", err);
        await btn.editReply({
          content: "❌ Ticket kapatılırken bir hata oluştu.",
          embeds: [],
          components: [],
        }).catch(() => {});
      }
      return;
    }

    // Kapama iptali
    if (customId === "ticket_cancel_close") {
      await btn.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle("✅ İptal Edildi")
            .setDescription("Ticket kapatma işlemi iptal edildi."),
        ],
        components: [],
      });
      return;
    }
  }
}
