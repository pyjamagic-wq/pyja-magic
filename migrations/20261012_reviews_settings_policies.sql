-- Enable customer review submissions and shared store settings on existing tables.
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approuve');

DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews"
  ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'approuve');

DROP POLICY IF EXISTS "Public can read store settings" ON settings;
CREATE POLICY "Public can read store settings"
  ON settings FOR SELECT TO anon, authenticated
  USING (key = 'store_settings');

DROP POLICY IF EXISTS "Public can insert store settings" ON settings;
CREATE POLICY "Public can insert store settings"
  ON settings FOR INSERT TO anon, authenticated
  WITH CHECK (key = 'store_settings');

DROP POLICY IF EXISTS "Public can update store settings" ON settings;
CREATE POLICY "Public can update store settings"
  ON settings FOR UPDATE TO anon, authenticated
  USING (key = 'store_settings')
  WITH CHECK (key = 'store_settings');