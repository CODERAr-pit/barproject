import { z } from "zod";
import { hashids } from "@/lib/hash";

export const hashedMongoId = z.string().transform((val, ctx) => {
  const decoded = hashids.decodeHex(val);
  if (!decoded || !/^[0-9a-fA-F]{24}$/.test(decoded)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid Barber ID",
    });
    return z.NEVER;
  }
  return decoded; 
});
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

// 1. USER SCHEMA VALIDATION
export const UserValidation = z.object({
  username: z.string().trim().optional(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["customer", "barber"]).default("customer").optional(),
  image: z.string().url().optional().nullable(),
  emailVerified: z.coerce.date().optional().nullable(),
});

// 2. BARBER SCHEMA VALIDATION
const daySchedule = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format").default("09:00"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format").default("17:00"),
  isOff: z.boolean().default(false),
});

export const BarberValidation = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  phone: z.string().min(10, "Phone number is too short").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  shopName: z.string().trim().min(1, "Shop name is required"),
  services: z.array(z.string()).default([]),
  
  shopImage: z.string().optional().nullable(),
  barberImage: z.string().optional().nullable(),
  
  // Enforces exactly 12 digits, identical to your Mongoose match
  aadharNumber: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits"),
  
  dob: z.coerce.date(),
  gender: z.enum(["Male", "Female", "Other"]),
  
  aadharFront: z.string().min(1, "Aadhar front image is required"),
  aadharBack: z.string().min(1, "Aadhar back image is required"),
  selfieWithAadhar: z.string().optional().nullable(),
  
  // GPS Coordinates bounds checking
  lat: z.number().min(-90).max(90, "Invalid latitude"),
  lng: z.number().min(-180).max(180, "Invalid longitude"),
  
  upvote: z.number().int().default(0).optional(),
  downvote: z.number().int().default(0).optional(),
  isAvailable: z.boolean().default(true).optional(),
  nextAvailableAt: z.coerce.date().optional().nullable(),

  schedule: z.object({
    monday: daySchedule.optional(),
    tuesday: daySchedule.optional(),
    wednesday: daySchedule.optional(),
    thursday: daySchedule.optional(),
    friday: daySchedule.optional(),
    saturday: daySchedule.optional(),
    sunday: daySchedule.optional(),
    blockedSlots: z.array(
      z.object({
        date: z.string(), // e.g., "2026-05-11"
        slots: z.array(z.string()), // e.g., ["01:00 PM"]
      })
    ).optional(),
  }).optional(),
});

// 3. BOOKING SCHEMA VALIDATION
// 3. BOOKING SCHEMA VALIDATION
export const BookingValidation = z.object({
  barber: hashedMongoId,
  user: hashedMongoId, 
  date: z.string(), // Frontend sends "YYYY-MM-DD" string
  start: z.coerce.date(), // Matches frontend
  end: z.coerce.date(),   // Matches frontend
  
  service: z.array(z.string()).min(1, "At least one service must be selected"), // Matches frontend
  status: z.enum(["confirmed", "empty"]).default("empty").optional(),
});

// LOGIN VALIDATION For BAR
export const LoginValidation = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  
  password: z.string().min(1, "Password is required"), 
  role: z.enum(["customer", "barber"]).optional(),
});

//searchparams validation
export const GetQueryValidation = z.object({
  userId: hashedMongoId.optional(),
  barberId: hashedMongoId.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
  scope: z.enum(["upcoming"]).optional(),
});

export const UpdateBarberValidation = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().optional(),
  
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  
  shopName: z.string().min(2, "Shop name must be at least 2 characters").optional(),
  
  services: z.array(z.string()).optional(),
  
  shopImage: z.string().url("Must be a valid URL").optional(),
  barberImage: z.string().url("Must be a valid URL").optional(),
  
  isAvailable: z.boolean().optional(),
  
  nextAvailableAt: z.coerce.date().nullable().optional(), 
});