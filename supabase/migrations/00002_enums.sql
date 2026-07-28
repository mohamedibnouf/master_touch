-- Shared enums
DO $$ BEGIN
  CREATE TYPE public.app_locale AS ENUM ('ar', 'en');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.contact_channel_type AS ENUM (
    'email', 'phone', 'whatsapp', 'fax', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.contact_message_status AS ENUM (
    'new', 'read', 'replied', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.media_type AS ENUM ('image', 'video', 'document', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
