import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectdb();
  const { name, email, position, baseSalary, doj, password } = await req.json();

  if (!password) {
    return Response.json({ success: false, message: "Password is required" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emp = await Employee.create({
    name,
    email,
    position,
    baseSalary,
    doj,
    password: hashedPassword,  // ✅ Store hashed password
  });

  return Response.json({ success: true, employee: emp });
}