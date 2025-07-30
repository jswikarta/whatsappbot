import { getContentType } from "@whiskeysockets/baileys";
import {
  GetNote,
  GetConfig,
  Fnumber,
  UpdateBalance,
  UpdateGroup,
  UpdateOrderHistory,
  GetDigiConfig,
} from "../libraries/private.library.js";
import {
  DigiBalance,
  DigiDeposit,
  DigiProduct,
  DigiTransaction,
} from "../libraries/digiflazz.library.js";

export async function GroupModule(wbot, message) {
  const messageType = getContentType(message.message);
  const messageMssg = message.message;
  const messageText =
    messageType === "conversation"
      ? messageMssg.conversation
      : messageType === "imageMessage"
      ? messageMssg.imageMessage.caption
      : messageType === "videoMessage"
      ? messageMssg.videoMessage.caption
      : messageType === "extendedTextMessage"
      ? messageMssg.extendedTextMessage.text
      : "";

  const messageRjid = message.key.remoteJid;
  const messageHead = messageText.split(" ")[0].toLowerCase();
  const messageBody = messageText.split(" ").slice(1).join(" ");
  const messageFrom =
    message.key.participant.split("@")[0] + "_1@s.whatsapp.net";

  const botOwner = `274049011818746_1@s.whatsapp.net`;
  const botPhone = wbot.user.id.split(":")[0] + "@s.whatsapp.net";
  const fromOwner = messageFrom === botOwner ? true : false;

  const group = await wbot.groupMetadata(messageRjid);
  const groupId = group.id;
  const groupName = group.subject;
  const groupUser = group.participants;

  const note = GetNote();
  const groupConf = GetConfig(groupId);
  const groupSign = groupConf?.groupSign;
  const groupProfit = groupConf?.groupProfit;
  const groupDigikey = groupConf?.groupDigikey;
  const groupDigiuser = groupConf?.groupDigiuser;
  const groupBalance = groupConf?.groupBalance;
  const groupPayment = groupConf?.groupPayment;
  const groupCategory = groupConf?.groupCategory;
  const groupProduct = groupConf?.groupProduct;

  const digiConfig = GetDigiConfig();
  const digiBank = digiConfig.digiBank;

  const groupBalance2 = groupBalance?.filter((i) => i.phone === messageFrom);
  const userBalance = groupBalance2?.length ? groupBalance2[0].balance : 0;

  // const botAdmin = !groupUser.filter(
  //   (i) => i.id === botPhone && i.admin !== null
  // ).length
  //   ? false
  //   : true;

  const fromAdmin = !groupUser.filter(
    (i) => i.id === messageFrom && i.admin !== null
  ).length
    ? false
    : true;

  const groupAdmin = groupUser.filter(
    (i) => i.admin !== null && i.id !== botPhone
  );

  // if (botAdmin)
  switch (messageHead) {
    case "h":
    case "htag":
    case "hidetag":
      {
        if (!fromAdmin) break;
        await wbot.sendMessage(messageRjid, {
          text: messageBody,
          mentions: groupUser.map((i) => i.id),
        });
      }
      break;
    case "config":
      await ReplyConfig();
      break;
    case "add":
      if (groupConf) await ReplyAdd();
      break;
    case "info":
      if (groupConf && !messageBody) await ReplyInfo();
      break;
    case "menu":
      if (groupConf && !messageBody) await ReplyMenu();
      break;
    case "pay":
    case "payment":
      if (groupConf && !messageBody) await ReplyPay();
      break;
    case "depo":
    case "deposit":
      if (groupConf) await ReplyDepo();
      break;
    case "ok":
    case "terima":
      if (groupConf) await ReplyTerima();
      break;
    case "restok":
    case "restock":
      if (groupConf) await ReplyRestok();
      break;
    case "order":
    case "trxproses":
      if (groupConf) await ReplyOrder();
      break;
    default:
      if (groupConf && !messageBody) await ReplyCategory();
      if (groupConf && !messageBody) await ReplyProduct();
      break;
  }
  return messageText;

  /** -------------------------
   * FUNCTION REPLY INFO
  -------------------------- */
  async function ReplyInfo() {
    if (fromAdmin) {
      const digiBalance = await DigiBalance(groupDigikey, groupDigiuser);
      if (digiBalance?.rc === "83")
        return await wbot.sendMessage(messageRjid, {
          text: note.notif4,
          mentions: [messageFrom],
        });

      if (digiBalance?.rc === "42")
        return await wbot.sendMessage(messageRjid, {
          text: note.notif14,
          mentions: [messageFrom],
        });

      let totalBalance = 0;
      for (let balance of groupBalance) {
        totalBalance = totalBalance + balance.balance;
      }

      let messageSend =
        `_*INFORMASI GROUP ANDA :*_` +
        `\n•───────────────•` +
        `\n  ${groupSign} Digi Balance : ${Fnumber(digiBalance)}` +
        `\n  ${groupSign} User Balance : ${Fnumber(totalBalance)}` +
        `\n  ${groupSign} Signature : ${groupSign}` +
        `\n  ${groupSign} Profit : ${groupProfit}` +
        `\n\n_*MENU KHUSUS ADMIN :*_` +
        `\n•───────────────•` +
        `\n  ${groupSign} restok` +
        `\n  ${groupSign} config sign` +
        `\n  ${groupSign} config profit` +
        `\n  ${groupSign} config digikey` +
        `\n  ${groupSign} config digiuser` +
        `\n  ${groupSign} add payment` +
        `\n  ${groupSign} add category` +
        `\n  ${groupSign} add product`;

      await wbot.sendMessage(messageFrom, { text: messageSend });
    }
  }

  /** -------------------------
   * FUNCTION REPLY MENU
  -------------------------- */
  async function ReplyMenu() {
    const userPhone = messageFrom.split("@")[0];

    let messageSend =
      `_*MENU ${groupName.toUpperCase()}*_` +
      `\n•───────────────•` +
      `\n  ${groupSign} *👤 :* ${userPhone}` +
      `\n  ${groupSign} *💵 :* ${Fnumber(userBalance)}` +
      `\n\n_*MENU TRANSAKSI :*_` +
      `\n  ${groupSign} pay` +
      `\n  ${groupSign} depo` +
      `\n  ${groupSign} order` +
      `\n\n_*MENU CATEGORY :*_`;

    if (groupCategory.length === 0) {
      messageSend += `\n  ${groupSign} Belum ada category`;
    } else {
      for (let category of groupCategory) {
        messageSend += `\n  ${groupSign} ${category}`;
      }
    }

    await wbot.sendMessage(messageRjid, {
      text: messageSend + note.bot1,
      mentions: [messageFrom],
    });
  }

  /** -------------------------
   * FUNCTION REPLY PAYMENT
  -------------------------- */
  async function ReplyPay() {
    if (groupPayment.length === 0) {
      await wbot.sendMessage(messageRjid, {
        text: note.notif18,
        mentions: [messageFrom],
      });
    }

    let messageSend = `*METODE PEMBAYARAN*\n ${note.top1}`;
    for (let payment of groupPayment) {
      messageSend +=
        `\n\n*Payment ${payment.brand}*` +
        `\n${groupSign} Rekening : ${payment.rekening}` +
        `\n${groupSign} Atas Nama : ${payment.atasnama}`;
    }

    await wbot.sendMessage(messageRjid, {
      text: messageSend + note.bot2,
      mentions: [messageFrom],
    });
  }

  /** -------------------------
   * FUNCTION REPLY DEPOSIT
  -------------------------- */
  async function ReplyDepo() {
    if (messageType !== "imageMessage")
      await wbot.sendMessage(messageRjid, {
        text: note.notif2,
        mentions: [messageFrom],
      });
    else if (!messageBody || isNaN(messageBody))
      await wbot.sendMessage(messageRjid, {
        text: note.notif3,
        mentions: [messageFrom],
      });
    else {
      await wbot.sendMessage(messageRjid, {
        text: note.notif1,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY TERIMA
  -------------------------- */
  async function ReplyTerima() {
    if (!fromAdmin) return;

    const dataTerima = messageMssg.extendedTextMessage.contextInfo;
    const textTerima = dataTerima.quotedMessage.imageMessage.caption;

    const phone = dataTerima.participant;
    const command = textTerima.split(" ")[0].toLowerCase();
    const balance = textTerima.split(" ")[1];

    if (command !== "depo" && command !== "deposit")
      return await wbot.sendMessage(messageRjid, {
        text: note.notif7,
        mentions: [messageFrom],
      });

    UpdateBalance(groupConf, phone, balance);
    const messageSend =
      `*PAYMENT SUCCESS*` +
      `\n•───────────────•\n` +
      `Berhasil Deposit sebesar ${Fnumber(balance)}`;

    await wbot.sendMessage(messageRjid, {
      text: messageSend,
      mentions: [phone],
    });
  }

  /** -------------------------
   * FUNCTION REPLY CATEGORY
  -------------------------- */
  async function ReplyCategory() {
    const category = groupCategory.filter((i) => i === messageHead)[0];

    if (category) {
      let messageSend = `*LIST ${category.toUpperCase()}*\n•───────────────•\n`;
      for (let product of groupProduct) {
        if (product.category === category)
          messageSend +=
            `\n${groupSign} *${product.code}* ` +
            `( _${product.brand.toLowerCase()}_ )`;
      }

      await wbot.sendMessage(messageRjid, {
        text: messageSend + note.bot1,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY PRODUCT
  -------------------------- */
  async function ReplyProduct() {
    const product = groupProduct.filter((i) => i.code === messageHead)[0];

    if (product) {
      const digiProduct = await DigiProduct(groupDigikey, groupDigiuser);
      if (digiProduct?.rc === "83")
        return await wbot.sendMessage(messageRjid, {
          text: note.notif4,
          mentions: [messageFrom],
        });

      if (digiProduct?.rc === "42")
        return await wbot.sendMessage(messageRjid, {
          text: note.notif14,
        });

      const digiProduct2 = digiProduct
        .filter((i) => i.brand.toLowerCase() === product.brand)
        .sort((i, j) => i.price - j.price);

      let productUmum = "";
      let productMember = "";
      let productOther = "";
      for (let i of digiProduct2) {
        const productPrice = ProductPrice(groupProfit, product, i.price);

        if (i.type === "Umum" || i.type === "Customer") {
          if (i.seller_product_status)
            productUmum +=
              `\n\n*${i.product_name}*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
          else
            productUmum +=
              `\n\n*~${i.product_name}~*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
        } else if (i.type === "Membership") {
          if (i.seller_product_status)
            productMember +=
              `\n\n*${i.product_name}*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
          else
            productMember +=
              `\n\n*~${i.product_name}~*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
        } else {
          if (i.seller_product_status)
            productOther +=
              `\n\n*${i.product_name}*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
          else
            productOther +=
              `\n\n*~${i.product_name}~*` +
              `\n${groupSign} Harga : ${Fnumber(productPrice)}` +
              `\n${groupSign} Sku : ${i.buyer_sku_code}`;
        }
      }

      let messageSend =
        `*MENU ${product.brand.toUpperCase()}*${note.top2}` +
        productUmum +
        productMember +
        productOther;

      await wbot.sendMessage(messageRjid, {
        text: messageSend,
        mentions: [messageFrom],
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY RESTOK SALDO DIGIFLAZZ
  -------------------------- */
  async function ReplyRestok() {
    if (!fromAdmin) return;
    const restokData = messageBody.split("..");
    const restokAmount = Number(restokData[0]);
    const restokBank = restokData[1]?.toUpperCase();
    const restokUser = restokData[2]?.toUpperCase();

    if (isNaN(restokAmount) || !restokBank || !restokUser)
      return await wbot.sendMessage(messageRjid, {
        text: note.format6,
        mentions: [messageFrom],
      });

    if (!digiBank.some((i) => i.bank === restokBank))
      return await wbot.sendMessage(messageRjid, {
        text: note.notif17,
        mentions: [messageFrom],
      });

    const digiDeposit = await DigiDeposit(
      groupDigikey,
      groupDigiuser,
      restokAmount,
      restokBank,
      restokUser
    );

    if (digiDeposit?.rc === "83")
      return await wbot.sendMessage(messageRjid, {
        text: note.notif4,
        mentions: [messageFrom],
      });

    if (digiDeposit?.rc === "00") {
      const bank = digiBank.filter((i) => i.bank === restokBank)[0];
      const messageSend =
        `*REQUEST RESTOK SUCCESS*` +
        `\n•───────────────•` +
        `\n  ${groupSign} *Bank :* ${bank.bank}` +
        `\n  ${groupSign} *Amount :* ${Fnumber(digiDeposit.amount)}` +
        `\n  ${groupSign} *Rekening :* ${bank.rekening}` +
        `\n  ${groupSign} *Atas Nama :* ${bank.atasnama}` +
        `\n  ${groupSign} *Note :* ${digiDeposit.notes}` +
        `\n•───────────────•` +
        `\n_** Silahkan transfer ke nomor rekening yang tertera. Note harus dimasukkan pada bagian berita ketika transfer_`;

      await wbot.sendMessage(messageFrom, {
        text: messageSend,
      });
    } else {
      const bank = digiBank.filter((i) => i.bank === restokBank)[0];
      const messageSend =
        `*REQUEST RESTOK ERROR*` +
        `\n•───────────────•` +
        `\n${digiDeposit.message}`;

      await wbot.sendMessage(messageFrom, {
        text: messageSend,
      });
    }
  }

  /** -------------------------
   * FUNCTION REPLY ORDER
  -------------------------- */
  async function ReplyOrder() {
    const orderSku = messageBody.split(" ")[0];
    const orderId = messageBody.split(" ")[1];
    const orderRef = OrderRef();

    if (!orderSku || !orderId)
      return await wbot.sendMessage(messageRjid, {
        text: note.format1,
        mentions: [messageFrom],
      });

    const digiProduct = await DigiProduct(groupDigikey, groupDigiuser);
    if (digiProduct?.rc === "83")
      return await wbot.sendMessage(messageRjid, {
        text: note.notif4,
        mentions: [messageFrom],
      });

    if (digiProduct?.rc === "42")
      return await wbot.sendMessage(messageRjid, {
        text: note.notif4,
        mentions: [messageFrom],
      });

    const digiProduct2 = digiProduct.filter(
      (i) => i.buyer_sku_code === orderSku
    )[0];

    if (!digiProduct2)
      return await wbot.sendMessage(messageRjid, {
        text: note.notif5,
        mentions: [messageFrom],
      });

    const product = groupProduct.filter(
      (i) => i.brand === digiProduct2.brand.toLowerCase()
    )[0];

    const orderPrice = ProductPrice(groupProfit, product, digiProduct2.price);
    if (!fromAdmin)
      if (orderPrice > userBalance)
        return await wbot.sendMessage(messageRjid, {
          text: note.notif6,
          mentions: [messageFrom],
        });

    UpdateOrderHistory({ ref_id: orderRef });
    await wbot.sendMessage(
      messageRjid,
      {
        text:
          `*ORDER ${orderRef} PROCESS*` +
          `\n•───────────────•` +
          `\n_Pesanan anda sedang diproses, dan status akan terupdate otomatis._`,
      },
      { quoted: message }
    );

    if (!fromAdmin) UpdateBalance(groupConf, messageFrom, orderPrice * -1);
    const orderResult = await DigiTransaction(
      groupDigikey,
      groupDigiuser,
      orderRef,
      orderId,
      orderSku
    );

    let messageSend = "";
    if (orderResult?.rc === "00") {
      messageSend =
        `*ORDER ${orderRef} SUCCESS*` +
        `\n•───────────────•` +
        `\n${groupSign} *Id :* ${orderId}` +
        `\n${groupSign} *Sku :* ${orderSku}` +
        `\n${groupSign} *Harga :* ${Fnumber(orderPrice)}` +
        `\n•───────────────•` +
        `\n_Pesanan anda berhasil diproses, Terimakasih sudah order._`;

      if (product.category === "voucher" || product.category === "pln") {
        let messageUser =
          `*KODE VOUCHER ANDA*` +
          `\n•───────────────•` +
          `\n${groupSign} ${orderResult.sn}` +
          `\n•───────────────•` +
          `\n_Pesanan anda berhasil diproses, terimakasih sudah order._`;

        await wbot.sendMessage(
          messageFrom,
          { text: messageUser },
          { quoted: message }
        );
      }
    } else {
      messageSend =
        `*ORDER ${orderRef} FAILED*` +
        `\n•───────────────•` +
        `\n${groupSign} *Id :* ${orderId}` +
        `\n${groupSign} *Sku :* ${orderSku}` +
        `\n${groupSign} *Harga :* ${Fnumber(orderPrice)}` +
        `\n•───────────────•` +
        `\n_Pesanan anda gagal, mohon menunggu pengecekan dari admin._`;

      if (!fromAdmin) UpdateBalance(groupConf, messageFrom, orderPrice);
      for (let admin of groupAdmin) {
        await wbot.sendMessage(admin.id, {
          text: `ERROR ${orderRef}: ` + orderResult.message,
        });
      }
    }

    orderResult.groupId = groupId;
    UpdateOrderHistory(orderResult);
    await wbot.sendMessage(
      messageRjid,
      { text: messageSend },
      { quoted: message }
    );
  }

  /** -------------------------
   * FUNCTION REPLY CONFIG
  -------------------------- */
  async function ReplyConfig() {
    const configHead = messageBody.split(" ")[0].toLowerCase();
    const configBody = messageBody.split(" ")[1];

    switch (configHead) {
      case "group":
        {
          if (fromOwner) {
            if (groupConf)
              return await wbot.sendMessage(messageRjid, {
                text: note.notif8,
                mentions: [messageFrom],
              });

            UpdateGroup({
              groupId: groupId,
              groupSign: "❐",
              groupProfit: 1.5,
              groupDigikey: "",
              groupDigiuser: "",
              groupBalance: [],
              groupPayment: [],
              groupCategory: [],
              groupProduct: [],
            });

            let messageSend = `*GROUP BERHASIL DIDAFTARKAN*` + note.bot3;
            await wbot.sendMessage(messageRjid, {
              text: messageSend,
              mentions: [messageFrom],
            });
          }
        }
        break;

      case "sign":
      case "profit":
      case "digikey":
      case "digiuser":
        {
          if (!fromAdmin)
            return await wbot.sendMessage(messageRjid, {
              text: note.notif10,
              mentions: [messageFrom],
            });

          if (!groupConf)
            return await wbot.sendMessage(messageRjid, {
              text: note.notif8,
              mentions: [messageFrom],
            });

          if (!configBody)
            return await wbot.sendMessage(messageRjid, {
              text: note.format2,
              mentions: [messageFrom],
            });

          switch (configHead) {
            case "sign":
              groupConf.groupSign = configBody;
              break;
            case "profit":
              groupConf.groupProfit = configBody;
              break;
            case "digikey":
              groupConf.groupDigikey = configBody;
              break;
            case "digiuser":
              groupConf.groupDigiuser = configBody;
              break;
          }

          UpdateGroup(groupConf);
          let messageSend = `*GROUP BERHASIL DIUPDATE*` + note.bot3;
          await wbot.sendMessage(messageRjid, {
            text: messageSend,
            mentions: [messageFrom],
          });

          await wbot.sendMessage(messageRjid, {
            delete: message.key,
          });
        }
        break;
    }
  }

  /** -------------------------
   * FUNCTION REPLY ADD
  -------------------------- */
  async function ReplyAdd() {
    if (!fromAdmin)
      return await wbot.sendMessage(messageRjid, {
        text: note.notif10,
        mentions: [messageFrom],
      });

    const addHead = messageBody.split(" ")[0].toLowerCase();
    const addBody = messageBody.split(" ").slice(1).join(" ");

    let messageSend =
      `*LIST COMMAND ADD*` +
      `\n•───────────────•\n` +
      `\n${groupSign} add payment` +
      `\n${groupSign} add category` +
      `\n${groupSign} add product`;

    if (!addHead)
      return await wbot.sendMessage(messageRjid, {
        text: messageSend + note.bot1,
        mentions: [messageFrom],
      });

    switch (addHead) {
      case "pay":
      case "payment":
        {
          if (!addBody)
            return await wbot.sendMessage(messageRjid, {
              text: note.format3,
              mentions: [messageFrom],
            });

          const newPayment = addBody.split("..");
          const newBrand = newPayment[0];
          const newRekening = newPayment[1];
          const newAtasnama = newPayment[2];

          if (!newBrand || !newRekening || !newAtasnama)
            return await wbot.sendMessage(messageRjid, {
              text: note.format3,
              mentions: [messageFrom],
            });

          groupConf.groupPayment.push({
            brand: newBrand,
            rekening: newRekening,
            atasnama: newAtasnama,
          });

          UpdateGroup(groupConf);
          await wbot.sendMessage(messageRjid, {
            text: note.notif11,
            mentions: [messageFrom],
          });
        }
        break;

      case "cat":
      case "category":
        {
          const newCategory = addBody.replace(/[^a-zA-Z]/g, "");
          const addCategory = newCategory.toLowerCase();
          const cekCategory = groupCategory.filter((i) => i === addCategory);

          if (!addCategory)
            return await wbot.sendMessage(messageRjid, {
              text: note.format4,
              mentions: [messageFrom],
            });

          if (cekCategory.length)
            return await wbot.sendMessage(messageRjid, {
              text: note.notif16,
              mentions: [messageFrom],
            });

          groupConf.groupCategory.push(addCategory);

          UpdateGroup(groupConf);
          await wbot.sendMessage(messageRjid, {
            text: note.notif12,
            mentions: [messageFrom],
          });
        }
        break;

      case "product":
        {
          const newProduct = addBody.split("..");
          const newCode = newProduct[0]?.toLowerCase();
          const newBrand = newProduct[1]?.toLowerCase();
          const newProfit = Number(newProduct[2]);
          const newCategory = newProduct[3]?.toLowerCase();
          const cekCategory = groupCategory.filter((i) => i === newCategory);

          if (!newCode || !newBrand || isNaN(newProfit) || !newCategory)
            return await wbot.sendMessage(messageRjid, {
              text: note.format5,
              mentions: [messageFrom],
            });

          if (!cekCategory.length)
            return await wbot.sendMessage(messageRjid, {
              text: note.notif13,
              mentions: [messageFrom],
            });

          groupConf.groupProduct.push({
            code: newCode,
            brand: newBrand,
            profit: newProfit,
            category: newCategory,
          });

          UpdateGroup(groupConf);
          const messageSend = note.notif15 + `*${newCategory}* untuk melihat.`;
          await wbot.sendMessage(messageRjid, {
            text: messageSend,
            mentions: [messageFrom],
          });
        }
        break;
    }
  }
}

/** -------------------------
 * FUNCTION PRODUCT PRICE
-------------------------- */
function ProductPrice(groupProfit, product, price) {
  let profit;

  if (!product?.profit) profit = (groupProfit / 100) * price;
  else profit = product.profit;

  return Math.ceil(price + profit);
}

/** -------------------------
 * FUNCTION ORDER REF
-------------------------- */
function OrderRef() {
  const date = new Date();
  const pad = (num) => num.toString().padStart(2, "0");

  const year = date.getFullYear().toString().slice(-2);
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
