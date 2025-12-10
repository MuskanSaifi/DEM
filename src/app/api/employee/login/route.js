import connectdb from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectdb();
  const { email, password } = await req.json();

  // 👇 Important: select password explicitly
  const emp = await Employee.findOne({ email }).select("+password");

  // 🔐 Validate password
  if (!emp || !emp.password || !(await bcrypt.compare(password, emp.password))) {
    return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign({ id: emp._id }, JWT_SECRET, { expiresIn: "7d" });

  return Response.json({
    success: true,
    token,
    employee: {
      id: emp._id,
      name: emp.name,
      email: emp.email,
      position: emp.position,
    },
  });
}
