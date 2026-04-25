import md5 from "md5";
import axios from "axios";

const baseUrl = "https://api.digiflazz.com/v1";
const digiUser = process.env.DIGIFLAZZ_USER;
const digiKey = process.env.DIGIFLAZZ_KEY;

const retryDelay = 10_000;
const rcPending = "03";

async function digiPost(endpoint, payload) {
  try {
    const response = await axios.post(`${baseUrl}/${endpoint}`, payload);
    return { ok: true, data: response.data.data };
  } catch (err) {
    const data = err.response?.data?.data ?? { message: err.message };
    return { ok: false, data };
  }
}

export async function digiTransaction(orderRef, orderId, orderSku, orderPrice) {
  const result = await digiPost("transaction", {
    ref_id: orderRef,
    customer_no: orderId,
    buyer_sku_code: orderSku,
    username: digiUser,
    max_price: orderPrice,
    sign: md5(digiUser + digiKey + orderRef),
  });

  if (!result.ok) return result.data;

  if (result.data.rc === rcPending) {
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    return digiTransaction(orderRef, orderId, orderSku, orderPrice);
  }

  return result.data;
}
