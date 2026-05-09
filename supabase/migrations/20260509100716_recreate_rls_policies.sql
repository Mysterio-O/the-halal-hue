-- ============================================================
-- STEP 1: Drop old public functions
-- ============================================================

DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_manager();
DROP FUNCTION IF EXISTS public.is_anon();
DROP FUNCTION IF EXISTS public.is_manager_or_above();
DROP FUNCTION IF EXISTS public.is_admin_or_above();


-- ============================================================
-- STEP 2: Create private schema + recreate functions there
-- (PostgREST only exposes `public` schema, so /rpc/ can't reach these)
-- ============================================================

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'SUPER_ADMIN'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'ADMIN'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION private.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'MANAGER'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION private.is_anon()
RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'anon';
$$ LANGUAGE sql STABLE
   SET search_path = public, auth;

CREATE OR REPLACE FUNCTION private.is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT private.is_manager() OR private.is_admin() OR private.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth, private;

CREATE OR REPLACE FUNCTION private.is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT private.is_admin() OR private.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE
   SET search_path = public, auth, private;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated, anon, service_role;


-- ============================================================
-- STEP 3: Drop all old policies
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "user_profiles: read own"                          ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: admin read all"                    ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: update own"                        ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: admin create manager"              ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: admin update manager"              ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: delete own"                        ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: super admin delete manager or admin" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles: super admin restrict manager or admin" ON public.user_profiles;

-- categories
DROP POLICY IF EXISTS "categories: public read"    ON public.categories;
DROP POLICY IF EXISTS "categories: manager insert" ON public.categories;
DROP POLICY IF EXISTS "categories: manager update" ON public.categories;
DROP POLICY IF EXISTS "categories: manager delete" ON public.categories;

-- offers
DROP POLICY IF EXISTS "offers: public read"    ON public.offers;
DROP POLICY IF EXISTS "offers: manager insert" ON public.offers;
DROP POLICY IF EXISTS "offers: manager update" ON public.offers;
DROP POLICY IF EXISTS "offers: manager delete" ON public.offers;

-- products
DROP POLICY IF EXISTS "products: public read"    ON public.products;
DROP POLICY IF EXISTS "products: manager insert" ON public.products;
DROP POLICY IF EXISTS "products: manager update" ON public.products;
DROP POLICY IF EXISTS "products: manager delete" ON public.products;

-- price_lists
DROP POLICY IF EXISTS "price_lists: public read"    ON public.price_lists;
DROP POLICY IF EXISTS "price_lists: manager insert" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists: manager update" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists: manager delete" ON public.price_lists;

-- product_photos
DROP POLICY IF EXISTS "product_photos: public read"    ON public.product_photos;
DROP POLICY IF EXISTS "product_photos: manager insert" ON public.product_photos;
DROP POLICY IF EXISTS "product_photos: manager update" ON public.product_photos;
DROP POLICY IF EXISTS "product_photos: manager delete" ON public.product_photos;

-- storage
DROP POLICY IF EXISTS "user-photos: upload own"      ON storage.objects;
DROP POLICY IF EXISTS "user-photos: read own"        ON storage.objects;
DROP POLICY IF EXISTS "user-photos: admin read all"  ON storage.objects;
DROP POLICY IF EXISTS "user-photos: update own"      ON storage.objects;
DROP POLICY IF EXISTS "user-photos: delete own"      ON storage.objects;
DROP POLICY IF EXISTS "product-photos: public read"  ON storage.objects;
DROP POLICY IF EXISTS "product-photos: manager insert" ON storage.objects;
DROP POLICY IF EXISTS "product-photos: manager update" ON storage.objects;
DROP POLICY IF EXISTS "product-photos: manager delete" ON storage.objects;


-- ============================================================
-- STEP 4: Recreate all policies using private.* functions
-- ============================================================

-- user_profiles
CREATE POLICY "user_profiles: read own"
ON public.user_profiles FOR SELECT
USING ( user_id = auth.uid() );

CREATE POLICY "user_profiles: admin read all"
ON public.user_profiles FOR SELECT
USING ( private.is_admin_or_above() );

CREATE POLICY "user_profiles: update own"
ON public.user_profiles FOR UPDATE
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "user_profiles: admin create manager"
ON public.user_profiles FOR INSERT
WITH CHECK (
  private.is_admin_or_above()
  AND user_role = 'MANAGER'
);

CREATE POLICY "user_profiles: admin update manager"
ON public.user_profiles FOR UPDATE
USING ( private.is_admin_or_above() AND user_role = 'MANAGER' )
WITH CHECK ( private.is_admin_or_above() AND user_role = 'MANAGER' );

CREATE POLICY "user_profiles: delete own"
ON public.user_profiles FOR DELETE
USING ( user_id = auth.uid() );

CREATE POLICY "user_profiles: super admin delete manager or admin"
ON public.user_profiles FOR DELETE
USING ( private.is_super_admin() AND user_role IN ('MANAGER', 'ADMIN') );

CREATE POLICY "user_profiles: super admin restrict manager or admin"
ON public.user_profiles FOR UPDATE
USING ( private.is_super_admin() AND user_role IN ('MANAGER', 'ADMIN') )
WITH CHECK ( private.is_super_admin() AND user_role IN ('MANAGER', 'ADMIN') );

-- categories
CREATE POLICY "categories: public read"    ON public.categories FOR SELECT USING ( true );
CREATE POLICY "categories: manager insert" ON public.categories FOR INSERT WITH CHECK ( private.is_manager_or_above() );
CREATE POLICY "categories: manager update" ON public.categories FOR UPDATE USING ( private.is_manager_or_above() );
CREATE POLICY "categories: manager delete" ON public.categories FOR DELETE USING ( private.is_manager_or_above() );

-- offers
CREATE POLICY "offers: public read"    ON public.offers FOR SELECT USING ( true );
CREATE POLICY "offers: manager insert" ON public.offers FOR INSERT WITH CHECK ( private.is_manager_or_above() );
CREATE POLICY "offers: manager update" ON public.offers FOR UPDATE USING ( private.is_manager_or_above() );
CREATE POLICY "offers: manager delete" ON public.offers FOR DELETE USING ( private.is_manager_or_above() );

-- products
CREATE POLICY "products: public read"    ON public.products FOR SELECT USING ( true );
CREATE POLICY "products: manager insert" ON public.products FOR INSERT WITH CHECK ( private.is_manager_or_above() );
CREATE POLICY "products: manager update" ON public.products FOR UPDATE USING ( private.is_manager_or_above() );
CREATE POLICY "products: manager delete" ON public.products FOR DELETE USING ( private.is_manager_or_above() );

-- price_lists
CREATE POLICY "price_lists: public read"    ON public.price_lists FOR SELECT USING ( true );
CREATE POLICY "price_lists: manager insert" ON public.price_lists FOR INSERT WITH CHECK ( private.is_manager_or_above() );
CREATE POLICY "price_lists: manager update" ON public.price_lists FOR UPDATE USING ( private.is_manager_or_above() );
CREATE POLICY "price_lists: manager delete" ON public.price_lists FOR DELETE USING ( private.is_manager_or_above() );

-- product_photos
CREATE POLICY "product_photos: public read"    ON public.product_photos FOR SELECT USING ( true );
CREATE POLICY "product_photos: manager insert" ON public.product_photos FOR INSERT WITH CHECK ( private.is_manager_or_above() );
CREATE POLICY "product_photos: manager update" ON public.product_photos FOR UPDATE USING ( private.is_manager_or_above() );
CREATE POLICY "product_photos: manager delete" ON public.product_photos FOR DELETE USING ( private.is_manager_or_above() );

-- storage: user-photos
CREATE POLICY "user-photos: upload own"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "user-photos: read own"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "user-photos: admin read all"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user-photos' AND private.is_admin_or_above() );

CREATE POLICY "user-photos: update own"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "user-photos: delete own"
ON storage.objects FOR DELETE
USING ( bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1] );

-- storage: product-photos (no SELECT policy — public bucket serves URLs directly)
CREATE POLICY "product-photos: manager insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-photos' AND private.is_manager_or_above() );

CREATE POLICY "product-photos: manager update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-photos' AND private.is_manager_or_above() );

CREATE POLICY "product-photos: manager delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-photos' AND private.is_manager_or_above() );