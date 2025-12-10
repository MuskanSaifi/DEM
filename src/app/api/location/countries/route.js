import connectDB from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find({}, "mobileNumber");

  const countryCodes = [...new Set(users.map(user => user.mobileNumber.slice(0, 3)))];
console.log(countryCodes)
  return Response.json({ countries: countryCodes });
}
