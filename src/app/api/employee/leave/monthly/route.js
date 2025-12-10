// api/employee/leave/monthly GET handler
import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function GET(req) {
  await connectdb();
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month")); // 1-based
  const year = parseInt(searchParams.get("year"));

  const employees = await Employee.find();

  const data = employees.map(emp => {
    // Find the relevant monthly salary details
    const monthlyDetails = emp.monthlySalaryDetails.find(
      (detail) => detail.month === month && detail.year === year
    );

    // Default values if no entry is found for the month
    const totalApprovedLeaves = monthlyDetails ? monthlyDetails.totalApprovedLeaves : 0;
    const totalDeduction = monthlyDetails ? monthlyDetails.calculatedDeduction : 0;
    const finalSalary = monthlyDetails ? monthlyDetails.finalMonthlySalary : emp.baseSalary; // If no deductions, final is base

    return {
      employeeId: emp._id,
      name: emp.name,
      baseSalary: emp.baseSalary,
      finalSalary: finalSalary,
      totalDeduction: totalDeduction,
      leaves: totalApprovedLeaves
    };
  });

  return Response.json(data);
}