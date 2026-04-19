import { getNotes } from "../libraries/private.library.js";

export default async function depositCommand(message, messageBody) {
  const notes = getNotes();

  if (!message.hasMedia || !messageBody || isNaN(messageBody)) {
    return notes.notifDeposit2;
  }

  return notes.notifDeposit1;
}
