-- ============================================================================
-- SCHÉMA SUPABASE POSTGRESQL — BOUTIQUE PYJA MAGIC (ALGÉRIE)
-- Version: 1.0.0
-- Tables, Contraintes, Index, Politiques RLS et Triggers
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUPPRESSION PRÉVENTIVE EN MODE DÉVELOPPEMENT
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS order_status_history CASCADE;
-- DROP TABLE IF EXISTS inventory_movements CASCADE;
-- DROP TABLE IF EXISTS yalidine_shipments CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS product_variants CASCADE;
-- DROP TABLE IF EXISTS product_images CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS colors CASCADE;
-- DROP TABLE IF EXISTS sizes CASCADE;
-- DROP TABLE IF EXISTS wilayas CASCADE;
-- DROP TABLE IF EXISTS coupons CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;

-- 3. TABLE ADMINS (Pour gestion du panneau d'administration)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE WILAYAS (Les 69 wilayas d'Algérie avec tarifs de livraison)
CREATE TABLE IF NOT EXISTS wilayas (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 600.00,
  stop_desk_fee NUMERIC(10, 2) DEFAULT 400.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE CATÉGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLES COULEURS ET TAILLES
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  hex VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(10) NOT NULL UNIQUE, -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price > price),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  material VARCHAR(150),
  care_instructions TEXT,
  location VARCHAR(150) DEFAULT 'Atelier Principal',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLE IMAGES PRODUITS
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLE VARIANTES PRODUITS (Combinaison Unique Taille + Couleur + Stock)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE RESTRICT,
  sku VARCHAR(100) UNIQUE,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  price_override NUMERIC(10, 2) CHECK (price_override IS NULL OR price_override >= 0),
  image_url TEXT,
  location VARCHAR(150),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_product_size_color UNIQUE (product_id, size_id, color_id)
);

-- 10. TABLE MOUVEMENTS DE STOCK (Historique et Traçabilité)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entree', 'sortie', 'correction', 'retour')),
  reason TEXT NOT NULL,
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABLE CLIENTES (Agrégation des informations clientes sans compte)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255),
  wilaya_id INT REFERENCES wilayas(id) ON DELETE SET NULL,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  last_order_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLE COUPONS ET CODES PROMOTIONNELS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount NUMERIC(10, 2),
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_count INT DEFAULT 0,
  max_usage INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TABLE COMMANDES
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL, -- Ex: PJM-8K42X9
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  wilaya_id INT NOT NULL REFERENCES wilayas(id) ON DELETE RESTRICT,
  wilaya_name VARCHAR(100) NOT NULL,
  commune VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  delivery_type VARCHAR(20) NOT NULL DEFAULT 'domicile' CHECK (delivery_type IN ('domicile', 'stopdesk')),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10, 2) DEFAULT 0.00,
  coupon_code VARCHAR(50),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod')),
  status VARCHAR(30) NOT NULL DEFAULT 'en_attente' CHECK (status IN (
    'en_attente', 'nouvelle', 'acceptee', 'confirmee', 'preparation', 'arriver_yalidine', 'expediee', 'en_livraison', 'livree', 'refusee', 'annulee', 'retour'
  )),
  yalidine_tracking_number VARCHAR(100),
  yalidine_status VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABLE ARTICLES DE COMMANDE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  size_name VARCHAR(20) NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  location VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. TABLE HISTORIQUE DES STATUTS DE COMMANDE (Timeline)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  author VARCHAR(100) NOT NULL DEFAULT 'Système',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TABLE EXPÉDITIONS YALIDINE
CREATE TABLE IF NOT EXISTS yalidine_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(100) UNIQUE NOT NULL,
  label_url TEXT,
  courier_status VARCHAR(100),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. TABLE AVIS CLIENTS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  customer_wilaya VARCHAR(100),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'approuve' CHECK (status IN ('en_attente', 'approuve', 'rejete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. TABLE PARAMÈTRES BOUTIQUE
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SÉCURITÉ : ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 1. Tout le monde peut voir les produits actifs, catégories, couleurs, tailles, wilayas
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public can view variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Public can view sizes" ON sizes FOR SELECT USING (true);
CREATE POLICY "Public can view wilayas" ON wilayas FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (status = 'approuve');
CREATE POLICY "Public can validate active coupons" ON coupons FOR SELECT USING (is_active = true);

-- 2. Commandes : N'importe qui peut créer une commande
CREATE POLICY "Anyone can create order" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create timeline event" ON order_status_history FOR INSERT WITH CHECK (true);

-- 3. Suivi commande : La cliente peut lire sa commande par son code de commande
CREATE POLICY "Customer can view own order by code" ON orders FOR SELECT USING (true);
CREATE POLICY "Customer can view own order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Customer can view timeline" ON order_status_history FOR SELECT USING (true);

-- 4. Administrateurs authentifiés : Accès total
CREATE POLICY "Admins full access products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access variants" ON product_variants FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access orders" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access order items" ON order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access movements" ON inventory_movements FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access wilayas" ON wilayas FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access coupons" ON coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access reviews" ON reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins full access settings" ON settings FOR ALL TO authenticated USING (true);

-- ============================================================================
-- FONCTION ATOMIQUE DE MISE À JOUR DU STOCK LORS D'UNE COMMANDE
-- ============================================================================
CREATE OR REPLACE FUNCTION decrement_variant_stock(
  p_variant_id UUID,
  p_quantity INT,
  p_order_number VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_stock INT;
  v_product_id UUID;
BEGIN
  -- Verrouillage de la ligne pour éviter la concurrence
  SELECT stock_quantity, product_id INTO v_current_stock, v_product_id
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Variante non trouvée';
  END IF;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuffisant pour cette variante';
  END IF;

  -- Décrémentation
  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_variant_id;

  -- Enregistrement du mouvement
  INSERT INTO inventory_movements (
    product_id,
    variant_id,
    quantity,
    type,
    reason,
    created_at
  ) VALUES (
    v_product_id,
    p_variant_id,
    -p_quantity,
    'sortie',
    'Commande client ' || p_order_number,
    NOW()
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
