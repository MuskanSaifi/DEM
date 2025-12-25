// /api/employee/salary/route.js (Modified from my previous response)
import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await connectdb();
  const token = req.headers.get("authorization")?.split(" ")[1];
  const { month, year } = Object.fromEntries(new URL(req.url).searchParams);

  if (!token) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const emp = await Employee.findById(decoded.id);

    if (!emp) {
      return Response.json({ success: false, message: "Employee not found." }, { status: 404 });
    }

    const targetMonth = parseInt(month);
    const targetYear = parseInt(year);

    const monthlyDetails = emp.monthlySalaryDetails.find(
      (detail) => detail.month === targetMonth && detail.year === targetYear
    );

    let finalSalary = emp.baseSalary;
    let deduction = 0; // Initialize deduction to 0
    let totalLeaves = 0; // Initialize totalLeaves to 0

    if (monthlyDetails) {
      finalSalary = monthlyDetails.finalMonthlySalary;
      deduction = monthlyDetails.calculatedDeduction;
      totalLeaves = monthlyDetails.totalApprovedLeaves;
    }

    return Response.json({
      baseSalary: emp.baseSalary,
      deduction: deduction, // Ensure deduction is explicitly returned
      finalSalary: finalSalary,
      totalLeaves: totalLeaves
    });

  } catch (err) {
    console.error("Error fetching employee salary:", err);
    // Return more specific error for debugging
    return Response.json({ success: false, message: "Invalid token or server error.", error: err.message }, { status: 401 });
  }
}