import fs from "fs";

export function formatCurrency(amount) {
  return amount.toLocaleString("id-ID");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath));
}

export function getNotes() {
  return readJson("./src/configs/notes.json");
}

export function getPayments() {
  return readJson("./src/configs/payments.json");
}

export function getProducts(code = "all") {
  const products = readJson("./src/configs/products.json");

  if (!code) return null;
  else if (code === "all") return products;
  return products.find((i) => i.code === code) ?? null;
}

export function getVariants(code, sku) {
  const variants = readJson("./src/configs/variants.json");

  if (!code && !sku) return variants;
  if (code) return variants.filter((i) => i.product === code) ?? [];
  if (sku) return variants.find((i) => i.sku === sku) ?? null;
}

export function getUserBalance(userNumber) {
  const users = readJson("./src/configs/users.json");
  const user = users.find((i) => i.userNumber === userNumber);

  return user?.userBalance ?? 0;
}

export function updateBalance(userNumber, addBalance = 0, reduceBalance = 0) {
  const fsPath = "./src/configs/users.json";
  const users = readJson(fsPath);

  const addition = Number(addBalance);
  const reduction = Number(reduceBalance);

  const userIndex = users.findIndex((u) => u.userNumber === userNumber);

  if (userIndex === -1) {
    users.push({
      userNumber,
      userBalance: addition - reduction,
    });
  } else {
    const currentBalance = Number(users[userIndex].userBalance || 0);
    users[userIndex].userBalance = currentBalance + addition - reduction;
  }

  fs.writeFileSync(fsPath, JSON.stringify(users, null, 2), "utf8");
}

export function getOrderRef() {
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
