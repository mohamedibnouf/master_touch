import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  remember: z.boolean().optional(),
  locale: z.string().default("ar"),
  next: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
  confirm: z.string().min(8).max(128),
}).refine((data) => data.password === data.confirm, {
  message: "passwordMismatch",
  path: ["confirm"],
});

export const themeUpdateSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  foreground_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  border_radius: z.string().min(1).max(32),
  font_sans: z.string().min(1).max(64),
  font_display: z.string().min(1).max(64),
});

export const siteSettingsUpdateSchema = z.object({
  site_name_en: z.string().trim().max(120).optional(),
  site_name_ar: z.string().trim().max(120).optional(),
  website_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  default_locale: z.enum(["ar", "en"]).optional(),
  social_links: z.record(z.string(), z.string()).optional(),
});

export const serviceSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export function sanitizePlainText(value: string): string {
  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}
