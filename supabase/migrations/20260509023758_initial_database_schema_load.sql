CREATE TYPE USER_ROLES AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER');
CREATE TYPE USER_STATUS AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'RESTRICTED');
CREATE TYPE CATEGORY_STATUS AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE OFFER_STATUS AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE PRODUCT_STATUS AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');


CREATE TABLE IF NOT EXISTS public.user_profiles(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(40) NOT NULL,
    email VARCHAR(100) NOT NULL,
    user_role USER_ROLES DEFAULT 'MANAGER',
    user_status USER_STATUS DEFAULT 'ACTIVE',
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.categories(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_name VARCHAR(100) NOT NULL,
    cat_description TEXT,
    cat_status CATEGORY_STATUS DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    off_name VARCHAR(100) NOT NULL,
    description TEXT,
    off_ends TIMESTAMPTZ,
    off_discount_percentage INTEGER,
    off_status OFFER_STATUS DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    off_id uuid REFERENCES offers(id) ON DELETE SET NULL,
    pr_name VARCHAR(100) NOT NULL,
    pr_description TEXT,
    pr_status PRODUCT_STATUS DEFAULT 'ACTIVE',
    pr_sku VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_lists(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- products: frequently filtered by status and category
CREATE INDEX idx_products_cat_id ON products (cat_id);
CREATE INDEX idx_products_off_id ON products (off_id);
CREATE INDEX idx_products_status ON products (pr_status);

-- price_lists: always queried by product
CREATE INDEX idx_price_lists_product_id ON price_lists (product_id);

-- user_profiles: lookups by user_id and role
CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles (user_role);

-- offers: filter by active/non-expired offers
CREATE INDEX idx_offers_status ON offers (off_status);
CREATE INDEX idx_offers_ends ON offers (off_ends);