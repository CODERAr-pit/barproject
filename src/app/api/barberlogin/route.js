// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import BarberShop from "@/models/Barber";
// import bcrypt from "bcryptjs";
// import { LoginValidation } from "@/lib/validations";

// export async function POST(req) {
//   try {
//     // 1. Get raw data
//     const rawData = await req.json();

//     // 2. Zod Validation
//     const result = LoginValidation.safeParse(rawData);
    
//     if (!result.success) {
//       return NextResponse.json(
//         { error: "Invalid email or password format", details: result.error.format() },
//         { status: 400 }
//       );
//     }

//     // result.data is now 100% safe, trimmed, and lowercased by Zod
//     const { email, pass } = result.data;

//     await connectDB();
    
//     const user = await BarberShop.findOne({ email });

//     if (!user) {
//       return NextResponse.json(
//         { error: "Invalid credentials" }, // Pro-tip: Never say "Shop not found". It lets hackers guess which emails exist. Just say "Invalid credentials".
//         { status: 401 }
//       );
//     }


//     // 3. Compare password
//     const isPasswordValid = await bcrypt.compare(pass, user.password);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { error: "Invalid credentials" },
//         { status: 401 }
//       );
//     }

//     // 4. Generate Redirect URL
//     const username = user.email.split("@")[0];
//     const redirectUrl = `/dashboard/${username}`;

//    // 1. Convert the weird Mongoose Document into a standard JavaScript object
//     const userObj = user.toObject();

//     // 2. Pull out the sensitive fields, and pack EVERYTHING else into `safeUser`
//     const { 
//       password, 
//       aadharNumber, 
//       aadharFront, 
//       aadharBack, 
//       selfieWithAadhar, 
//       ...safeUser 
//     } = userObj;

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Login successful",
//         redirectUrl,
//         user: safeUser, // Contains everything EXCEPT the 5 fields we pulled out above
//       },
//       { status: 200 }
//     );
    
//   } catch (error) {
//     console.error("Login error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }