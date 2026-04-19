import { getNotes, updateBalance } from "../libraries/private.library.js";

export default async function acceptedCommand(quotedMessage, quotedNumber) {
  const notes = getNotes();

  const [quotedMessageHead, ...quotedMessageRest] = quotedMessage.body.split(" ");
  const quotedMessageBody = quotedMessageRest.join(" ");

  const isDepositMessage =
    quotedMessageHead.toLowerCase() === "depo" ||
    quotedMessageHead.toLowerCase() === "deposit";

  if (
    !quotedMessage.hasMedia ||
    !quotedMessageBody ||
    isNaN(quotedMessageBody) ||
    !isDepositMessage
  ) {
    return notes.notifAccepted2;
  }

  updateBalance(quotedNumber, quotedMessageBody, 0);
  return notes.notifAccepted1;
}
