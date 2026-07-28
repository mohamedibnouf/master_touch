"use server";

import { headers } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { contactMessageSchema, sanitizePlainText } from "@/lib/validations";
import { assertRateLimit } from "@/infrastructure/rate-limit/service";
import { toActionError, ValidationError, DatabaseError } from "@/domain/shared/errors";
import { writeAuditLog } from "@/lib/permissions";

export async function submitContactMessage(input: unknown) {
  try {
    const parsed = contactMessageSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.flatten());

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    await assertRateLimit(ip, { name: "contact", limit: 8, window: "60 s" });

    const payload = {
      name: sanitizePlainText(parsed.data.name),
      email: sanitizePlainText(parsed.data.email),
      phone: parsed.data.phone ? sanitizePlainText(parsed.data.phone) : null,
      subject: parsed.data.subject ? sanitizePlainText(parsed.data.subject) : null,
      message: sanitizePlainText(parsed.data.message),
      ip_address: ip,
      user_agent: hdrs.get("user-agent"),
    };

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert(payload);
    if (error) throw new DatabaseError(error.message, error);

    await writeAuditLog("contact.create", "contact_messages");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}
