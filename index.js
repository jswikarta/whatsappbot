import "dotenv/config";
import wwebjs from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import readline from "readline";
import groupChat from "./src/chats/group.chat.js";

const { Client, LocalAuth } = wwebjs;
const executablePath = process.env.EXECUTABLE_PATH;
const phoneNumber = process.env.PHONE_NUMBER;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    deviceName: "Whatsappbot",
    browserName: "Chrome",
    executablePath: executablePath,
    headless: true,
  },
  pairWithPhoneNumber: {
    phoneNumber: phoneNumber,
    showNotification: true,
    intervalMs: 180000,
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("code", (code) => {
  console.log("Pairing code:", code);
});

client.on("ready", () => {
  console.clear();
  console.log(
    `${chalk.bold.red(
      "\n[" +
        chalk.bold.white(" Dibuat Dengan") +
        chalk.bold.red(" ❤ ") +
        chalk.bold.white(` Oleh Johan Saka Wikarta `) +
        "]",
    )}\n${chalk.bold.red(
      "[" +
        chalk.bold.green(
          " WhatsApp" +
            chalk.bold.red(": ") +
            chalk.bold.green(`6282364491299 `),
        ) +
        "]",
    )}\n`,
  );
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

client.on("message", async (message) => {
  try {
    if (message.fromMe) return;
    if (message.type === "sticker") return;

    const chat = await message.getChat();
    const user = await message.getContact();

    const quotedMessage = message.hasQuotedMsg
      ? await message.getQuotedMessage()
      : null;

    const quotedUser = quotedMessage ? await quotedMessage.getContact() : null;

    if (chat.isGroup) {
      await groupChat(client, message, chat, user, quotedMessage, quotedUser);
    }

    const date = new Date(message.timestamp * 1000);
    const time = date.toLocaleString("id-ID");

    console.log(
      chalk.bold.green(`\n\n[${time}]`) +
        chalk.bold.white(`\nFrom    : ${user.number}`) +
        chalk.bold.white(`\nMessage : ${message.body}`),
    );
  } catch (error) {
    console.error(chalk.redBright("Error di Main: "), error);
  }
});

client.initialize();
