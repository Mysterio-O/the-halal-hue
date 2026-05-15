-- ─────────────────────────────────────────────────────────────
-- Run this in your Supabase SQL editor (Database → SQL Editor)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(

    -- ── Product counts ────────────────────────────────────────
    'total_products',     (SELECT COUNT(*) FROM products),
    'active_products',    (SELECT COUNT(*) FROM products WHERE pr_status = 'ACTIVE'),
    'inactive_products',  (SELECT COUNT(*) FROM products WHERE pr_status = 'INACTIVE'),
    'archived_products',  (SELECT COUNT(*) FROM products WHERE pr_status = 'ARCHIVED'),

    -- ── Category counts ───────────────────────────────────────
    'total_categories',   (SELECT COUNT(*) FROM categories),
    'active_categories',  (SELECT COUNT(*) FROM categories WHERE cat_status = 'ACTIVE'),

    -- ── Offer counts ──────────────────────────────────────────
    'total_offers',       (SELECT COUNT(*) FROM offers),
    'active_offers',      (SELECT COUNT(*) FROM offers WHERE off_status = 'ACTIVE'),

    -- ── User counts ───────────────────────────────────────────
    'total_users',        (SELECT COUNT(*) FROM user_profiles),
    'active_users',       (SELECT COUNT(*) FROM user_profiles WHERE user_status = 'ACTIVE'),

    -- ── Price stats ───────────────────────────────────────────
    'avg_product_price',  (SELECT ROUND(AVG(price)::numeric, 2) FROM price_lists),
    'min_price',          (SELECT MIN(price) FROM price_lists),
    'max_price',          (SELECT MAX(price) FROM price_lists),

    -- ── Products with no price ────────────────────────────────
    'unpriced_products',  (
      SELECT COUNT(*) FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM price_lists pl WHERE pl.product_id = p.id
      )
    ),

    -- ── Products with no photo ────────────────────────────────
    'unphoto_products',   (
      SELECT COUNT(*) FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM product_photos ph WHERE ph.product_id = p.id
      )
    ),

    -- ── Products added in last 7 days ─────────────────────────
    'new_products_7d',    (
      SELECT COUNT(*) FROM products
      WHERE created_at >= NOW() - INTERVAL '7 days'
    ),

    -- ── Products added in last 30 days ────────────────────────
    'new_products_30d',   (
      SELECT COUNT(*) FROM products
      WHERE created_at >= NOW() - INTERVAL '30 days'
    ),

    -- ── Top 5 categories by product count ────────────────────
    'top_categories',     (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT c.cat_name, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.cat_id = c.id
        GROUP BY c.id, c.cat_name
        ORDER BY product_count DESC
        LIMIT 5
      ) t
    ),

    -- ── Recently added products (last 6) ─────────────────────
    'recent_products',    (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          p.id,
          p.pr_name,
          p.pr_status,
          p.pr_sku,
          p.created_at,
          c.cat_name,
          (SELECT MIN(price) FROM price_lists pl WHERE pl.product_id = p.id) AS lowest_price,
          (
            SELECT ph.photo_url
            FROM product_photos ph
            WHERE ph.product_id = p.id AND ph.is_primary = true
            LIMIT 1
          ) AS primary_photo
        FROM products p
        LEFT JOIN categories c ON c.id = p.cat_id
        ORDER BY p.created_at DESC
        LIMIT 6
      ) t
    ),

    -- ── Active offers with discount info ─────────────────────
    'active_offer_list',  (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          o.id,
          o.off_name,
          o.off_discount_percentage,
          o.off_ends,
          (SELECT COUNT(*) FROM products p WHERE p.off_id = o.id) AS product_count
        FROM offers o
        WHERE o.off_status = 'ACTIVE'
        ORDER BY o.off_discount_percentage DESC
        LIMIT 5
      ) t
    ),

    -- ── Products by status breakdown ──────────────────────────
    'status_breakdown',   (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT pr_status, COUNT(*) AS count
        FROM products
        GROUP BY pr_status
      ) t
    )

  ) INTO result;

  RETURN result;
END;
$$;