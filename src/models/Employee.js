import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  date: Date,
  type: {
    type: String,
    enum: ["full", "half"],
    required: true,
  },
  reason: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// New Schema for Monthly Salary Aggregates
const monthlySalaryDetailSchema = new mongoose.Schema({
  month: { type: Number, required: true, min: 1, max: 12 }, // 1 for Jan, 12 for Dec
  year: { type: Number, required: true },
  totalApprovedLeaves: { type: Number, default: 0 },
  calculatedDeduction: { type: Number, default: 0 },
  finalMonthlySalary: { type: Number, default: 0 },
});

const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  position: String,
  baseSalary: Number,
  doj: Date,
  leaves: [leaveSchema],
  password: {
    type: String,
    required: true,
    select: false // to exclude password by default
  },
  // Add this new field
  monthlySalaryDetails: [monthlySalaryDetailSchema]
});

export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema);