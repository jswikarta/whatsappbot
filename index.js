import {
  makeWASocket,
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
} from "baileys";
import pino from "pino";
import chalk from "chalk";
import { Boom } from "@hapi/boom";
import { ChatModule } from "./src/modules/chat.module.js";
import { GroupModule } from "./src/modules/group.module.js";

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

function StartTitle() {
  console.clear();
  console.log(
    `${chalk.bold.red(
      "\n[" +
        chalk.bold.white(" Dibuat Dengan") +
        chalk.bold.red(" ❤ ") +
        chalk.bold.white(` Oleh Johan Saka Wikarta `) +
        "]"
    )}\n${chalk.bold.red(
      "[" +
        chalk.bold.green(
          " WhatsApp" +
            chalk.bold.red(" : ") +
            chalk.bold.green(`6281316658899 `)
        ) +
        "]"
    )}\n`
  );
}

async function StartWbot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const wbot = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["Wbot by jswikarta", "Safari", "17.5.0"],
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    auth: state,
  });

  wbot.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.connectionLost) {
        console.log("Connection to Server Lost, Attempting to Reconnect...");
        StartWbot();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, Attempting to Reconnect...");
        StartWbot();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required...");
        StartWbot();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection Timed Out, Attempting to Reconnect...");
        StartWbot();
      } else if (reason === DisconnectReason.badSession) {
        console.log("Delete Session and Scan again...");
        StartWbot();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Close current Session first...");
        StartWbot();
      }
    } else if (connection === "open") {
      console.log(chalk.green(`✅ Koneksi Ke Server Terhubung.`));
    }
  });

  wbot.ev.on("messages.upsert", async (data) => {
    try {
      const message = data.messages[0];
      let messageText;

      if (!message) return;
      if (message.key.fromMe) return;
      if (message.key.id.startsWith("BAE5")) return;
      if (message.key.remoteJid === "status@broadcast") return;

      await wbot.readMessages([
        {
          id: message.key.id,
          remoteJid: message.key.remoteJid,
          participant: message.key.participant,
        },
      ]);

      if (message.key.remoteJid.endsWith("@g.us"))
        messageText = await GroupModule(wbot, message);
      else messageText = await ChatModule(wbot, message);

      const newDate = new Date(message?.messageTimestamp * 1000);
      let h = newDate.getHours();
      let i = newDate.getMinutes();
      let s = newDate.getSeconds();
      let d = newDate.getDate();
      let m = newDate.getMonth() + 1;
      let y = newDate.getFullYear();

      h = h.toString().length < 2 ? (h = `0${h}`) : h;
      i = i.toString().length < 2 ? (i = `0${i}`) : i;
      s = s.toString().length < 2 ? (s = `0${s}`) : s;
      d = d.toString().length < 2 ? (d = `0${d}`) : d;
      m = m.toString().length < 2 ? (m = `0${m}`) : m;

      console.log(
        chalk.bold.green(`\n\n[${d}/${m}/${y} - ${h}:${i}:${s}]`) +
          chalk.bold.white(`\nFrom : ${message?.pushName}`) +
          chalk.bold.white(`\nMessage : ${messageText}`)
      );
    } catch (error) {
      console.log(chalk.redBright(error));
    }
  });

  wbot.ev.on("group-participants.update", async (data) => {
    try {
      const metadata = await wbot.groupMetadata(data.id);
      const participants = data.participants;

      for (const participant of participants) {
        if (data.action === "add") {
          const messageSend =
            `_*Wellcome to ${metadata.subject}*_` +
            `\nMohon Dibaca :` +
            `\n${metadata.desc}`;

          await wbot.sendMessage(data.id, {
            text: messageSend,
            mentions: [participant],
          });
        }
      }
    } catch (error) {
      console.log(chalk.redBright(error));
    }
  });

  store.bind(wbot.ev);
  wbot.ev.on("creds.update", saveCreds);
}

StartTitle();
StartWbot();
