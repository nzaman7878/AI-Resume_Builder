import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { RegisterSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RegisterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const user = await User.create({ name, email, password });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}