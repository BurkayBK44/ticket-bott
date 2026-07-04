import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as panelKur from "./panelKur.js";
import * as panelEkle from "./panelEkle.js";
import * as yetkiliRol from "./yetkiliRol.js";
import * as logKanal from "./logKanal.js";
import * as yardim from "./yardim.js";
import * as yenidenBaslat from "./yenidenBaslat.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands: Command[] = [
  panelKur as Command,
  panelEkle as Command,
  yetkiliRol as Command,
  logKanal as Command,
  yardim as Command,
  yenidenBaslat as Command,
];

export const commandMap = new Map<string, Command>(
  commands.map((cmd) => [cmd.data.name, cmd])
);
