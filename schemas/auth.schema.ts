import z from "zod/v3";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const registerSchema = z
  .object({
    ...loginSchema.shape,
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    confirmPassword: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Password do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
