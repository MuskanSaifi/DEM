import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function GET() {
  await connectdb();

  try {
    const employees = await Employee.find().lean();
    return Response.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}