import { digiTransaction } from "../libraries/digiflazz.library.js";
import {
  formatCurrency,
  getNotes,
  getOrderRef,
  getProducts,
  getVariants,
  updateBalance,
} from "../libraries/private.library.js";

export default async function purchaseCommand(
  client,
  chat,
  userNumber,
  messageBody,
  userBalance,
  groupAdmins,
  fromAdmin,
) {
  const [orderSku, orderId] = messageBody.split(" ");

  const notes = getNotes();
  const orderRef = getOrderRef();
  const variant = getVariants(null, orderSku);
  const product = getProducts(variant?.product);

  if (!orderSku || !orderId) return notes.formatPurchase;
  if (!variant) return notes.notifPurchase2;
  if (!fromAdmin && userBalance < variant.price) return notes.notifPurchase3;

  await chat.sendMessage(notes.notifPurchase1, {
    mentions: [`${userNumber}@c.us`],
  });

  updateBalance(userNumber, 0, variant.price);

  const digiResult = await digiTransaction(orderRef, orderId, orderSku);
  const isSuccess = digiResult.rc === "00";

  const purchaseMessage = [
    `*ORDER ${orderRef} ${isSuccess ? "SUCCESS" : "FAILED"}*`,
    `•───────────────•`,
    `  ❐ *Id :* ${orderId}`,
    `  ❐ *Sku :* ${orderSku}`,
    `  ❐ *Price :* ${formatCurrency(variant.price)}`,
    `•───────────────•`,
    isSuccess
      ? `_** Your order has been processed successfully. Thank you for your purchase!_`
      : `_** Your order has failed. Please wait while our admin conducts a manual check._`,
  ];

  if (isSuccess) {
    if (product?.category !== "voucher") {
      await client.sendMessage(
        `${userNumber}@c.us`,
        [
          `*ORDER ${orderRef} SUCCESS*`,
          `•───────────────•`,
          `  ❐ ${digiResult.sn}`,
          `•───────────────•`,
          `Your order has been processed successfully. Thank you for your purchase!`,
        ].join("\n"),
      );
    }
  } else {
    for (const admin of groupAdmins) {
      await client.sendMessage(
        `${admin.id.user}@c.us`,
        [
          `*ORDER ${orderRef} FAILED*`,
          `•───────────────•`,
          `  ❐ ${digiResult.message}`,
        ].join("\n"),
      );
    }

    updateBalance(userNumber, variant.price, 0);
  }

  return purchaseMessage.join("\n");
}
