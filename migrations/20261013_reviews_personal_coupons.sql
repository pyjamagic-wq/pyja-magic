-- Review submissions and private, email-bound, one-time purchase coupons.
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approuve');

DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews"
  ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'approuve');

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS issued_order_number VARCHAR(30);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS coupons_personal_email_unique
  ON coupons (lower(customer_email))
  WHERE customer_email IS NOT NULL;

DROP POLICY IF EXISTS "Public can validate active coupons" ON coupons;
CREATE POLICY "Public can validate active coupons"
  ON coupons FOR SELECT
  USING (is_active = TRUE AND customer_email IS NULL);

UPDATE coupons
SET is_active = FALSE
WHERE upper(code) = 'BIENVENU';

CREATE OR REPLACE FUNCTION issue_first_purchase_coupon(
  p_order_number TEXT,
  p_email TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(trim(coalesce(p_email, '')));
  v_order_email TEXT;
  v_existing_code TEXT;
  v_existing_order TEXT;
  v_code TEXT;
  v_attempt INT;
BEGIN
  IF v_email = '' THEN
    RETURN NULL;
  END IF;

  SELECT lower(email)
  INTO v_order_email
  FROM orders
  WHERE order_number = trim(p_order_number);

  IF v_order_email IS NULL OR v_order_email <> v_email THEN
    RETURN NULL;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_email)::BIGINT);

  SELECT code, issued_order_number
  INTO v_existing_code, v_existing_order
  FROM coupons
  WHERE lower(customer_email) = v_email;

  IF FOUND THEN
    IF v_existing_order = trim(p_order_number) THEN
      RETURN v_existing_code;
    END IF;
    RETURN NULL;
  END IF;

  FOR v_attempt IN 1..5 LOOP
    v_code := 'PYJA-' || upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 12));
    INSERT INTO coupons (
      code,
      discount_type,
      discount_value,
      min_order_amount,
      usage_count,
      max_usage,
      is_active,
      customer_email,
      issued_order_number
    ) VALUES (
      v_code,
      'percentage',
      5,
      0,
      0,
      1,
      TRUE,
      v_email,
      trim(p_order_number)
    ) ON CONFLICT (code) DO NOTHING;

    IF FOUND THEN
      RETURN v_code;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION preview_personal_coupon(
  p_code TEXT,
  p_email TEXT,
  p_subtotal NUMERIC
) RETURNS TABLE (discount_amount NUMERIC)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LEAST(
    round(p_subtotal * c.discount_value / 100),
    coalesce(c.max_discount, p_subtotal),
    p_subtotal
  )::NUMERIC
  FROM coupons c
  WHERE c.code = upper(trim(p_code))
    AND c.discount_type = 'percentage'
    AND c.customer_email IS NOT NULL
    AND lower(c.customer_email) = lower(trim(p_email))
    AND c.is_active = TRUE
    AND c.max_usage IS NOT NULL
    AND c.usage_count < c.max_usage
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND p_subtotal >= coalesce(c.min_order_amount, 0);
$$;

CREATE OR REPLACE FUNCTION redeem_personal_coupon(
  p_code TEXT,
  p_email TEXT,
  p_subtotal NUMERIC
) RETURNS TABLE (discount_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_discount NUMERIC;
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1
  WHERE code = upper(trim(p_code))
    AND discount_type = 'percentage'
    AND customer_email IS NOT NULL
    AND lower(customer_email) = lower(trim(p_email))
    AND is_active = TRUE
    AND max_usage IS NOT NULL
    AND usage_count < max_usage
    AND (expires_at IS NULL OR expires_at > now())
    AND p_subtotal >= coalesce(min_order_amount, 0)
  RETURNING * INTO v_coupon;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_discount := round(p_subtotal * v_coupon.discount_value / 100);
  IF v_coupon.max_discount IS NOT NULL THEN
    v_discount := least(v_discount, v_coupon.max_discount);
  END IF;

  RETURN QUERY SELECT least(v_discount, p_subtotal);
END;
$$;

REVOKE ALL ON FUNCTION issue_first_purchase_coupon(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION preview_personal_coupon(TEXT, TEXT, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION redeem_personal_coupon(TEXT, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION issue_first_purchase_coupon(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION preview_personal_coupon(TEXT, TEXT, NUMERIC) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION redeem_personal_coupon(TEXT, TEXT, NUMERIC) TO anon, authenticated;