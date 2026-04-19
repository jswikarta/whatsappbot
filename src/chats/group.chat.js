import acceptedCommand from "../commands/accepted.command.js";
import depositCommand from "../commands/deposit.command.js";
import menuCommand from "../commands/menu.command.js";
import paymentCommand from "../commands/payment.command.js";
import productCommand from "../commands/product.command.js";
import purchaseCommand from "../commands/purchase.command.js";
import { getUserBalance } from "../libraries/private.library.js";

export default async function groupChat(
  client,
  message,
  chat,
  user,
  quotedMessage,
  quotedUser,
) {
  const userNumber = user.number;
  const quotedNumber = quotedUser?.number;

  const userBalance = getUserBalance(userNumber);

  const [messageHead, ...messageRest] = message.body.split(" ");
  const messageBody = messageRest.join(" ");

  const group = chat.groupMetadata;
  const groupSubject = group.subject;
  const groupParticipants = group.participants;
  const groupAdmins = groupParticipants.filter((p) => p.isAdmin);

  const userParticipant = groupParticipants.find(
    (p) => p.id.user === userNumber,
  );

  const fromAdmin =
    userParticipant?.isAdmin || userParticipant?.isSuperAdmin || false;

  let text;

  switch (messageHead.toLowerCase()) {
    case "menu":
      text = await menuCommand(
        messageBody,
        groupSubject,
        userNumber,
        userBalance,
      );
      break;
    case "pay":
    case "payment":
      text = await paymentCommand(messageBody, groupSubject);
      break;
    case "depo":
    case "deposit":
      text = await depositCommand(message, messageBody);
      break;
    case "acc":
    case "accepted":
      text = fromAdmin
        ? await acceptedCommand(quotedMessage, quotedNumber)
        : null;
      break;
    case "buy":
    case "order":
    case "purchase":
      text = await purchaseCommand(
        client,
        chat,
        userNumber,
        messageBody,
        userBalance,
        groupAdmins,
        fromAdmin,
      );
      break;
    default:
      text = await productCommand(messageHead, messageBody);
      break;
  }

  if (text) {
    const mentionNumber = quotedNumber ?? userNumber;
    await chat.sendMessage(text, {
      mentions: [`${mentionNumber}@c.us`],
    });
  }
}
