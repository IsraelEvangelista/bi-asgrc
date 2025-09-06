-- Fix Function Search Path Mutable issues
-- This migration fixes the search_path parameter in functions to prevent security vulnerabilities

-- 1. Fix prevent_admin_profile_modification function
CREATE OR REPLACE FUNCTION public.prevent_admin_profile_modification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent modification of admin profiles
  IF OLD.nome ILIKE '%administrador%' AND NEW.nome NOT ILIKE '%administrador%' THEN
    RAISE EXCEPTION 'Cannot modify admin profile name';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_name TEXT;
BEGIN
  SELECT p.nome INTO profile_name
  FROM public."002_usuarios" u
  JOIN public."001_perfis" p ON u.perfil_id = p.id
  WHERE u.id = user_id;
  
  RETURN COALESCE(profile_name ILIKE '%administrador%', FALSE);
END;
$$;

-- 3. Fix has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_name TEXT;
BEGIN
  SELECT p.nome INTO profile_name
  FROM public."002_usuarios" u
  JOIN public."001_perfis" p ON u.perfil_id = p.id
  WHERE u.id = user_id;
  
  -- Admin has all permissions
  IF profile_name ILIKE '%administrador%' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permissions based on profile
  CASE permission_name
    WHEN 'read' THEN
      RETURN profile_name IS NOT NULL;
    WHEN 'write' THEN
      RETURN profile_name ILIKE '%gestor%' OR profile_name ILIKE '%administrador%';
    WHEN 'delete' THEN
      RETURN profile_name ILIKE '%administrador%';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- 4. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.prevent_admin_profile_modification() IS 'Prevents modification of admin profiles - Fixed search_path security issue';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Checks if user is admin - Fixed search_path security issue';
COMMENT ON FUNCTION public.has_permission(UUID, TEXT) IS 'Checks user permissions - Fixed search_path security issue';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates updated_at timestamp - Fixed search_path security issue';