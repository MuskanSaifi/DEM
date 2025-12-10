// api/employee/leave/apply/route.js
import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function POST(req) {
  await connectdb();
  const { employeeId, date, type, reason } = await req.json();

  try { // <<< Add a try-catch block here to catch errors during save
    const emp = await Employee.findById(employeeId);

    if (!emp) {
      return Response.json({ success: false, message: "Employee not found." }, { status: 404 });
    }

    emp.leaves.push({ date, type, reason });
    await emp.save();

    return Response.json({ success: true, message: "Leave applied successfully." }); // <<< Add a successful message

  } catch (error) {
    console.error("Error applying leave:", error); // Log the error on the server
    return Response.json({ success: false, message: "An error occurred while applying for leave." }, { status: 500 }); // Return a meaningful error message
  }
}