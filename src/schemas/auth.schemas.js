const { z } = require("zod");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

const registerSchema = z
  .object({
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
    email: z.string().email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });


module.exports = { registerSchema };
