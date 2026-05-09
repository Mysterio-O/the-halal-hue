-- ============================================================
-- HELPER FUNCTIONS (reusable in all policies)
-- ============================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'SUPER_ADMIN'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'ADMIN'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_role = 'MANAGER'
    AND user_status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_anon()
RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'anon';
$$ LANGUAGE sql STABLE;

-- Convenience: manager OR above
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT is_manager() OR is_admin() OR is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Convenience: admin OR above
CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT is_admin() OR is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_lists      ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- user_profiles POLICIES
-- ============================================================

-- Anyone can read their own profile
CREATE POLICY "user_profiles: read own"
ON public.user_profiles FOR SELECT
USING ( user_id = auth.uid() );

-- Admin / Super Admin can read ALL profiles
CREATE POLICY "user_profiles: admin read all"
ON public.user_profiles FOR SELECT
USING ( is_admin_or_above() );

-- Users can update their own profile
CREATE POLICY "user_profiles: update own"
ON public.user_profiles FOR UPDATE
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- Admin / Super Admin can create or update a MANAGER profile
CREATE POLICY "user_profiles: admin create manager"
ON public.user_profiles FOR INSERT
WITH CHECK (
  is_admin_or_above()
  AND user_role = 'MANAGER'
);

CREATE POLICY "user_profiles: admin update manager"
ON public.user_profiles FOR UPDATE
USING (
  is_admin_or_above()
  AND user_role = 'MANAGER'
)
WITH CHECK (
  is_admin_or_above()
  AND user_role = 'MANAGER'
);

-- Users can delete their own profile
CREATE POLICY "user_profiles: delete own"
ON public.user_profiles FOR DELETE
USING ( user_id = auth.uid() );

-- Only Super Admin can delete a MANAGER or ADMIN profile
CREATE POLICY "user_profiles: super admin delete manager or admin"
ON public.user_profiles FOR DELETE
USING (
  is_super_admin()
  AND user_role IN ('MANAGER', 'ADMIN')
);

-- Only Super Admin can restrict (set RESTRICTED status) a MANAGER or ADMIN
CREATE POLICY "user_profiles: super admin restrict manager or admin"
ON public.user_profiles FOR UPDATE
USING (
  is_super_admin()
  AND user_role IN ('MANAGER', 'ADMIN')
)
WITH CHECK (
  is_super_admin()
  AND user_role IN ('MANAGER', 'ADMIN')
);


-- ============================================================
-- categories POLICIES
-- ============================================================

-- Public read
CREATE POLICY "categories: public read"
ON public.categories FOR SELECT
USING ( true );

-- Manager or above can insert / update / delete
CREATE POLICY "categories: manager insert"
ON public.categories FOR INSERT
WITH CHECK ( is_manager_or_above() );

CREATE POLICY "categories: manager update"
ON public.categories FOR UPDATE
USING ( is_manager_or_above() );

CREATE POLICY "categories: manager delete"
ON public.categories FOR DELETE
USING ( is_manager_or_above() );


-- ============================================================
-- offers POLICIES
-- ============================================================

CREATE POLICY "offers: public read"
ON public.offers FOR SELECT
USING ( true );

CREATE POLICY "offers: manager insert"
ON public.offers FOR INSERT
WITH CHECK ( is_manager_or_above() );

CREATE POLICY "offers: manager update"
ON public.offers FOR UPDATE
USING ( is_manager_or_above() );

CREATE POLICY "offers: manager delete"
ON public.offers FOR DELETE
USING ( is_manager_or_above() );


-- ============================================================
-- products POLICIES
-- ============================================================

CREATE POLICY "products: public read"
ON public.products FOR SELECT
USING ( true );

CREATE POLICY "products: manager insert"
ON public.products FOR INSERT
WITH CHECK ( is_manager_or_above() );

CREATE POLICY "products: manager update"
ON public.products FOR UPDATE
USING ( is_manager_or_above() );

CREATE POLICY "products: manager delete"
ON public.products FOR DELETE
USING ( is_manager_or_above() );


-- ============================================================
-- price_lists POLICIES
-- ============================================================

CREATE POLICY "price_lists: public read"
ON public.price_lists FOR SELECT
USING ( true );

CREATE POLICY "price_lists: manager insert"
ON public.price_lists FOR INSERT
WITH CHECK ( is_manager_or_above() );

CREATE POLICY "price_lists: manager update"
ON public.price_lists FOR UPDATE
USING ( is_manager_or_above() );

CREATE POLICY "price_lists: manager delete"
ON public.price_lists FOR DELETE
USING ( is_manager_or_above() );


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('user-photos',    'user-photos',    false),  -- private: users see only their own
  ('product-photos', 'product-photos', true);   -- public: anyone can view


-- ============================================================
-- STORAGE: user-photos POLICIES
-- ============================================================

-- Users can upload their own photo (path must start with their uid)
CREATE POLICY "user-photos: upload own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own photo
CREATE POLICY "user-photos: read own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin / Super Admin can read ALL user photos
CREATE POLICY "user-photos: admin read all"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-photos'
  AND is_admin_or_above()
);

-- Users can update / delete their own photo
CREATE POLICY "user-photos: update own"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "user-photos: delete own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- ============================================================
-- STORAGE: product-photos POLICIES
-- ============================================================

-- Public can read all product photos (bucket is public anyway, but explicit is safer)
CREATE POLICY "product-photos: public read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-photos' );

-- Manager or above can upload / update / delete product photos
CREATE POLICY "product-photos: manager insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-photos'
  AND is_manager_or_above()
);

CREATE POLICY "product-photos: manager update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-photos'
  AND is_manager_or_above()
);

CREATE POLICY "product-photos: manager delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-photos'
  AND is_manager_or_above()
);


-- ============================================================
-- product_photos TABLE + POLICIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_photos(
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    photo_url   TEXT NOT NULL,
    storage_path TEXT NOT NULL,         -- e.g. "product-photos/abc123/cover.jpg"
    is_primary  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_photos: public read"
ON public.product_photos FOR SELECT
USING ( true );

CREATE POLICY "product_photos: manager insert"
ON public.product_photos FOR INSERT
WITH CHECK ( is_manager_or_above() );

CREATE POLICY "product_photos: manager update"
ON public.product_photos FOR UPDATE
USING ( is_manager_or_above() );

CREATE POLICY "product_photos: manager delete"
ON public.product_photos FOR DELETE
USING ( is_manager_or_above() );