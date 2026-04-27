import {
  formatCurrency,
  getNotes,
  getProducts,
} from "../libraries/private.library.js";

export default async function menuCommand(
  messageBody,
  groupSubject,
  userNumber,
  userBalance,
) {
  if (messageBody) return null;

  const notes = getNotes();
  const products = getProducts("all");
  const grouped = groupByCategory(products);

  const menuMessage = [
    `*Menu ${groupSubject}*`,
    `•───────────────•`,
    `  ❐ *👤 :* ${userNumber}`,
    `  ❐ *💵 :* ${formatCurrency(userBalance)}`,
    ``,
    `_*Transactions :*_`,
    `  ❐ pay`,
    `  ❐ depo`,
    `  ❐ order`,
  ];

  for (const [category, categoryProducts] of Object.entries(grouped)) {
    menuMessage.push(`\n_*${category} :*_`);

    for (const product of categoryProducts) {
      menuMessage.push(`  ❐ ${product.code} (${product.name})`);
    }
  }

  return menuMessage.join("\n") + notes.bottomMenu;
}

function groupByCategory(products) {
  return Object.groupBy(products, (product) => product.category);
}
