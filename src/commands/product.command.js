import {
  formatCurrency,
  getNotes,
  getProducts,
  getVariants,
} from "../libraries/private.library.js";

export default async function productCommand(messageHead, messageBody) {
  if (messageBody) return null;

  const notes = getNotes();
  const product = getProducts(messageHead);
  const variants = getVariants(messageHead, null);

  if (!product || !variants.length) return null;

  const productMessage = [`*Price List ${product.name}*`, `•───────────────•`];

  for (const variant of variants) {
    productMessage.push(
      ``,
      `*${variant.name}*`,
      `  ❐ Sku: *${variant.sku}*`,
      `  ❐ Price: *${formatCurrency(variant.price)}*`,
    );
  }

  return productMessage.join("\n") + notes.bottomProduct;
}
