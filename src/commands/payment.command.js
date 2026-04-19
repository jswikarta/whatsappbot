import { getNotes, getPayments } from "../libraries/private.library.js";

export default async function paymentCommand(messageBody, groupSubject) {
  if (messageBody) return null;

  const notes = getNotes();
  const payments = getPayments();

  const paymentMessage = [`*Payment ${groupSubject} :*`, `•───────────────•`];

  for (const payment of payments) {
    paymentMessage.push(
      ``,
      `*Payment ${payment.brand}*`,
      ` ❐ Account Number : ${payment.accountNumber}`,
      ` ❐ Account Name : ${payment.accountName}`,
    );
  }

  return paymentMessage.join("\n") + notes.bottomPayment;
}
