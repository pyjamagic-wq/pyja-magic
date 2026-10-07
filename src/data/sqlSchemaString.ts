export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- SCHÉMA SUPABASE POSTGRESQL — BOUTIQUE PYJA MAGIC (ALGÉRIE)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE ADMINS
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE WILAYAS (69 Wilayas d'Algérie avec tarifs)
CREATE TABLE IF NOT EXISTS wilayas (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 600.00,
  stop_desk_fee NUMERIC(10, 2) DEFAULT 400.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2),
  category VARCHAR(100) DEFAULT 'Pyjamas satin',
  material VARCHAR(150),
  care_instructions TEXT,
  location VARCHAR(150) DEFAULT 'Atelier Principal',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  color_images JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE VARIANTES (Taille + Couleur + Stock + Emplacement physique)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_name VARCHAR(20) NOT NULL, -- XS, S, M, L, XL, XXL
  color_name VARCHAR(50) NOT NULL,
  color_hex VARCHAR(10) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 3,
  location VARCHAR(150), -- Emplacement en stock (ex: Étagère A1 - Boîte M)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE COMMANDES
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL, -- Ex: PJM-8K42X9
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  wilaya_id INT NOT NULL,
  wilaya_name VARCHAR(100) NOT NULL,
  commune VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  delivery_type VARCHAR(20) NOT NULL DEFAULT 'domicile',
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0.00,
  coupon_code VARCHAR(50),
  total NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cod',
  status VARCHAR(30) NOT NULL DEFAULT 'en_attente',
  yalidine_tracking_number VARCHAR(100),
  yalidine_status VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ARTICLES DE COMMANDE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  size_name VARCHAR(20) NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  location VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TIMELINE DE COMMANDE
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  author VARCHAR(100) NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MOUVEMENTS DE STOCK
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PERMISSIONS SUPABASE (RLS DÉSACTIVÉ POUR PERMETTRE LA GESTION VIA L'ADMINISTRATION)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas DISABLE ROW LEVEL SECURITY;
`;

export const SUPABASE_RLS_FIX_SQL = `-- ============================================================================
-- SCRIPT DE DÉBLOCAGE SUPABASE (À EXÉCUTER DANS SQL EDITOR DE SUPABASE)
-- Résout l'erreur: "new row violates row-level security policy for table products"
-- ============================================================================

-- 1. Débloquer les droits d'écriture pour l'administration et les commandes :
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas DISABLE ROW LEVEL SECURITY;

-- 2. Ajouter les colonnes photos (générales + par couleur) si manquantes :
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'::jsonb;

-- 3. (Optionnel) Bucket Storage pour upload de fichiers :
-- Dans Supabase → Storage → New bucket → nom: product-images → Public: ON
`;
