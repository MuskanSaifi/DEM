/**
 * One-time: reactivate all sales employees auto-deactivated for low paid activity.
 * Run: node scripts/reactivate-low-performance-employees.mjs
 */
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env");
  process.exit(1);
}

const salesEmployeeSchema = new mongoose.Schema(
  {
    isActive: Boolean,
    inactiveReason: String,
    inactiveAt: Date,
    reactivatedAt: Date,
  },
  { strict: false }
);

const salesLeadSchema = new mongoose.Schema({}, { strict: false });

const SalesEmployee =
  mongoose.models.SalesEmployee ||
  mongoose.model("SalesEmployee", salesEmployeeSchema, "salesemployees");
const SalesLead =
  mongoose.models.SalesLead ||
  mongoose.model("SalesLead", salesLeadSchema, "salesleads");

async function main() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const leadResult = await SalesLead.updateMany(
    {
      paymentStatus: "paid",
      assignedTo: { $ne: null },
      $or: [
        { paidMarkedBy: null },
        { paidMarkedAt: null },
      ],
    },
    [
      {
        $set: {
          paidMarkedBy: "$assignedTo",
          paidMarkedAt: { $ifNull: ["$updatedAt", "$createdAt"] },
        },
      },
    ]
  );
  console.log("Backfilled paid markers on leads:", leadResult.modifiedCount);

  const empResult = await SalesEmployee.updateMany(
    { inactiveReason: "low_paid_activity" },
    {
      $set: {
        isActive: true,
        inactiveReason: null,
        inactiveAt: null,
        reactivatedAt: new Date(),
      },
    }
  );
  console.log("Reactivated employees:", empResult.modifiedCount);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
