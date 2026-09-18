import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import connectdb from "../src/lib/dbConnect.js";
import Buyer from "../src/models/Buyer.js";
import purchaseRequestSchema from "../src/models/purchaseRequestSchema.js";

const FAKE_EMAIL = /^user_\d+_[a-z0-9]+@gmail\.com$/i;
const NAME = /^rahul\s+sharma$/i;

async function main() {
  const shouldDelete = process.argv.includes("--delete");
  await connectdb();

  const fakeEmailFilter = { email: FAKE_EMAIL };
  const rahulFilter = { fullname: NAME };
  const spamFilter = { fullname: NAME, email: FAKE_EMAIL };

  const [totalBuyers, rahulCount, fakeEmailCount, spamCount] = await Promise.all([
    Buyer.countDocuments({}),
    Buyer.countDocuments(rahulFilter),
    Buyer.countDocuments(fakeEmailFilter),
    Buyer.countDocuments(spamFilter),
  ]);

  const byDay = await Buyer.aggregate([
    { $match: spamFilter },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  console.log(
    JSON.stringify(
      { totalBuyers, rahulCount, fakeEmailCount, spamCount, topDays: byDay, delete: shouldDelete },
      null,
      2
    )
  );

  if (!shouldDelete) {
    console.log("Dry run. Re-run with --delete to remove spam Rahul Sharma (fake user_* emails).");
    process.exit(0);
  }

  const spamIds = await Buyer.find(spamFilter).select("_id").lean();
  const ids = spamIds.map((d) => d._id);

  const prDel = await purchaseRequestSchema.deleteMany({
    buyerModel: "Buyer",
    buyer: { $in: ids },
  });
  const buyerDel = await Buyer.deleteMany(spamFilter);

  console.log(
    JSON.stringify(
      { deletedBuyers: buyerDel.deletedCount, deletedPurchaseRequests: prDel.deletedCount },
      null,
      2
    )
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
