"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { submitContactMessage } from "@/actions/contact";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label, Textarea } from "@/presentation/components/ui/primitives";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({ successMessage }: { successMessage: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await submitContactMessage(values);
      if (result.ok) {
        setDone(true);
        reset();
      }
    });
  };

  if (done) {
    return (
      <div className="glass rounded-2xl p-8 text-[var(--primary)]" role="status">
        <p className="font-semibold">{t("success")}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{successMessage}</p>
        <Button className="mt-4" variant="outline" onClick={() => setDone(false)}>
          {t("ok")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-4 rounded-2xl p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div>
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{t("required")}</p> : null}
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{t("required")}</p> : null}
      </div>
      <div>
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div>
        <Label htmlFor="subject">{t("subject")}</Label>
        <Input id="subject" {...register("subject")} />
      </div>
      <div>
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea id="message" {...register("message")} />
        {errors.message ? <p className="mt-1 text-xs text-red-600">{t("required")}</p> : null}
      </div>
      <Button type="submit" variant="accent" disabled={pending} className="w-full">
        {pending ? t("loading") : t("sendMessage")}
      </Button>
    </form>
  );
}
