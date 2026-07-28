-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'public-assets',
    'public-assets',
    TRUE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon']
  ),
  (
    'media',
    'media',
    FALSE,
    52428800,
    ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'video/mp4', 'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
ON CONFLICT (id) DO NOTHING;

-- Public assets: anyone can read
CREATE POLICY public_assets_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'public-assets');

CREATE POLICY public_assets_write ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.manage')
      OR public.has_permission(auth.uid(), 'theme.manage')
    )
  )
  WITH CHECK (
    bucket_id = 'public-assets'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.manage')
      OR public.has_permission(auth.uid(), 'theme.manage')
    )
  );

-- Private media bucket
CREATE POLICY media_bucket_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.view')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  );

CREATE POLICY media_bucket_write ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  )
  WITH CHECK (
    bucket_id = 'media'
    AND (
      public.has_permission(auth.uid(), 'media.create')
      OR public.has_permission(auth.uid(), 'media.update')
      OR public.has_permission(auth.uid(), 'media.manage')
    )
  );
