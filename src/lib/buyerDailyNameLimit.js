import Buyer from "@/models/Buyer";

export const SAME_NAME_TODAY_MESSAGE =
  "A buyer with this name has already been added today. Please try again tomorrow.";

export function normalizeBuyerName(name) {
  return String(name || "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Calendar day in IST (dashboard dates are India time). */
export function getIstDayBounds(now = new Date()) {
  const IST_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + IST_MS);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();
  const start = new Date(Date.UTC(y, m, d) - IST_MS);
  const end = new Date(Date.UTC(y, m, d + 1) - IST_MS);
  return { start, end };
}

export async function findSameNameBuyerToday(fullname) {
  const normalized = normalizeBuyerName(fullname);
  if (!normalized) return null;

  const { start, end } = getIstDayBounds();
  const pattern = `^${escapeRegex(normalized).replace(/ /g, "\\s+")}$`;

  return Buyer.findOne({
    createdAt: { $gte: start, $lt: end },
    fullname: { $regex: pattern, $options: "i" },
  })
    .select("_id fullname createdAt")
    .lean();
}

export async function isBuyerNameTakenToday(fullname) {
  const existing = await findSameNameBuyerToday(fullname);
  return !!existing;
}
