-- After creating the first Auth user in Supabase Dashboard (or Auth API),
-- run this with that user's UUID to grant Super Admin.
--
-- Example:
--   SELECT public.assign_super_admin('00000000-0000-0000-0000-000000000000');

CREATE OR REPLACE FUNCTION public.assign_super_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE slug = 'super_admin' AND deleted_at IS NULL;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'super_admin role missing — run seed 01_roles_permissions.sql first';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  UPDATE public.profiles
  SET is_active = TRUE, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
