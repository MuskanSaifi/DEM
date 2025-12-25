import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function PUT(req) {
  await connectdb();
  const { employeeId, leaveId, status } = await req.json();

  if (!employeeId || !leaveId || !status || !["approved", "rejected"].includes(status)) {
    return Response.json({ success: false, message: "Invalid request parameters." }, { status: 400 });
  }

  try {
    const emp = await Employee.findById(employeeId);

    if (!emp) {
      return Response.json({ success: false, message: "Employee not found." }, { status: 404 });
    }

    const leave = emp.leaves.id(leaveId);

    if (!leave) {
      return Response.json({ success: false, message: "Leave not found." }, { status: 404 });
    }

    const oldStatus = leave.status;
    leave.status = status;

    // --- Start: Crucial Salary Recalculation Logic ---
    // Recalculate only if the status change might affect deductions (i.e., from/to 'approved')
    if ((oldStatus !== "approved" && status === "approved") ||
        (oldStatus === "approved" && status !== "approved") ||
        (oldStatus === "pending" && status === "rejected") // Also recalculate if a pending becomes rejected, though it might not affect current deduction directly, it's good for consistency if future logic uses it.
       ) {

      const leaveDate = new Date(leave.date); // Use the date of the leave that was just processed
      const targetMonth = leaveDate.getUTCMonth() + 1; // getUTCMonth is 0-indexed (0-11)
      const targetYear = leaveDate.getUTCFullYear();

      let currentMonthDeduction = 0;
      let currentMonthApprovedLeavesCount = 0;

      // Iterate through ALL leaves of the employee to find approved ones for the target month/year
      emp.leaves.forEach(l => {
        const d = new Date(l.date);
        // Ensure comparison is consistent (e.g., using UTC values for month/year)
        if (d.getUTCMonth() + 1 === targetMonth && d.getUTCFullYear() === targetYear && l.status === "approved") {
          currentMonthApprovedLeavesCount++;
          const perDaySalary = emp.baseSalary / 26; // Assuming 26 working days in a month
          currentMonthDeduction += l.type === "full" ? perDaySalary : perDaySalary / 2;
        }
      });

      // Find or create the monthlySalaryDetails entry for the target month and year
      let monthlyDetailsEntry = emp.monthlySalaryDetails.find(
        (detail) => detail.month === targetMonth && detail.year === targetYear
      );

      if (!monthlyDetailsEntry) {
        // If no entry exists for this month/year, create a new one
        monthlyDetailsEntry = {
          month: targetMonth,
          year: targetYear,
          totalApprovedLeaves: 0, // Will be updated below
          calculatedDeduction: 0, // Will be updated below
          finalMonthlySalary: emp.baseSalary, // Default to baseSalary, then apply deduction
        };
        emp.monthlySalaryDetails.push(monthlyDetailsEntry);
      }

      // Update the values in the found/created monthlyDetailsEntry
      monthlyDetailsEntry.totalApprovedLeaves = currentMonthApprovedLeavesCount;
      monthlyDetailsEntry.calculatedDeduction = currentMonthDeduction;
      monthlyDetailsEntry.finalMonthlySalary = emp.baseSalary - currentMonthDeduction;
    }
    // --- End: Crucial Salary Recalculation Logic ---

    await emp.save(); // Save the updated employee document

    return Response.json({ success: true, message: `Leave ${status}. Salary details re-calculated.` });

  } catch (error) {
    console.error("Error updating leave status and salary:", error);
    return Response.json({ success: false, message: "Failed to update leave status due to server error.", error: error.message }, { status: 500 });
  }
}