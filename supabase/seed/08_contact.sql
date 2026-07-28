INSERT INTO public.contact_settings (id, map_embed_url, working_hours_json, is_form_enabled, notify_email)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.0!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1700000000000',
  '{"ar":{"sunday_thursday":"8:00 ص – 5:00 م","friday":"مغلق","saturday":"حسب الموعد"},"en":{"sunday_thursday":"8:00 AM – 5:00 PM","friday":"Closed","saturday":"By appointment"}}'::JSONB,
  TRUE,
  'info@mastertouchksa.com'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contact_setting_translations (settings_id, locale, headline, intro, form_success_message)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'ar', 'تواصل معنا', 'يسعدنا استقبال استفساراتكم ومشاريعكم القادمة.', 'تم إرسال رسالتكم بنجاح. سنتواصل معكم قريباً.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'en', 'Contact us', 'We welcome your inquiries and upcoming projects.', 'Your message was sent successfully. We will get back to you soon.')
ON CONFLICT (settings_id, locale) DO NOTHING;

INSERT INTO public.contact_branches (id, settings_id, latitude, longitude, sort_order, is_primary, is_enabled)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc02',
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  24.7136000,
  46.6753000,
  1,
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contact_branch_translations (branch_id, locale, name, address, city, country)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'ar', 'المقر الرئيسي', 'الرياض', 'الرياض', 'المملكة العربية السعودية'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'en', 'Head Office', 'Riyadh', 'Riyadh', 'Kingdom of Saudi Arabia')
ON CONFLICT (branch_id, locale) DO NOTHING;

INSERT INTO public.contact_channels (id, settings_id, branch_id, channel_type, value, label, sort_order, is_primary, is_enabled)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc11', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'email', 'info@mastertouchksa.com', 'Email', 1, TRUE, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccc12', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'phone', '+966-50-683-4610', 'Phone', 2, TRUE, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccc13', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccc02', 'whatsapp', '+966506834610', 'WhatsApp', 3, FALSE, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccc14', 'cccccccc-cccc-cccc-cccc-cccccccccc01', NULL, 'other', 'www.mastertouchksa.com', 'Website', 4, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;
