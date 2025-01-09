import md5 from "md5";
import axios from "axios";
import "dotenv/config";

export async function DigiBalance(groupDigikey, groupDigiuser) {
  try {
    const response = await axios.post(
      "https://api.digiflazz.com/v1/cek-saldo",
      {
        cmd: "deposit",
        username: groupDigiuser,
        sign: md5(groupDigiuser + groupDigikey + "depo"),
      }
    );

    return response.data.data.deposit;
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}

export async function DigiProduct(groupDigikey, groupDigiuser) {
  try {
    const response = await axios.post(
      "https://api.digiflazz.com/v1/price-list",
      {
        cmd: "prepaid",
        username: groupDigiuser,
        sign: md5(groupDigiuser + groupDigikey + "pricelist"),
      }
    );

    return response.data.data;
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}

export async function DigiDeposit(
  groupDigikey,
  groupDigiuser,
  restokAmount,
  restokBank,
  restokUser
) {
  try {
    const response = await axios.post("https://api.digiflazz.com/v1/deposit", {
      username: groupDigiuser,
      amount: restokAmount,
      bank: restokBank,
      owner_name: restokUser,
      sign: md5(groupDigiuser + groupDigikey + "deposit"),
    });

    return response.data.data;
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}

export async function DigiTransaction(
  groupDigikey,
  groupDigiuser,
  orderRef,
  orderId,
  orderSku
) {
  try {
    const response = await axios.post(
      "https://api.digiflazz.com/v1/transaction",
      {
        ref_id: orderRef,
        customer_no: orderId,
        buyer_sku_code: orderSku,
        username: groupDigiuser,
        sign: md5(groupDigiuser + groupDigikey + orderRef),
      }
    );

    if (response.data.data.rc === "03") {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return await DigiTransaction(
        groupDigikey,
        groupDigiuser,
        orderRef,
        orderId,
        orderSku
      );
    } else {
      return response.data.data;
    }
  } catch (err) {
    if (err.response) return err.response.data.data;
  }
}
