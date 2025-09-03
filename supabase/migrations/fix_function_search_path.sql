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
  IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Cannot modify admin profile role';
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
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public."001_perfis"
  WHERE id = user_id;
  
  RETURN COALESCE(user_role = 'admin', FALSE);
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
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public."001_perfis"
  WHERE id = user_id;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permissions based on role
  CASE permission_name
    WHEN 'read' THEN
      RETURN user_role IN ('admin', 'user', 'viewer');
    WHEN 'write' THEN
      RETURN user_role IN ('admin', 'user');
    WHEN 'delete' THEN
      RETURN user_role = 'admin';
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