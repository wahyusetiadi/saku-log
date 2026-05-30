-- ============================================
-- SAKU-LOG: Supabase Database Schema
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  currency VARCHAR(10) DEFAULT 'IDR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '💰',
  color VARCHAR(20) DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories (akan di-assign ke user saat register)
-- Ini adalah template kategori default

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_planned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLANNERS TABLE (Budget per bulan per kategori)
-- ============================================
CREATE TABLE IF NOT EXISTS planners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  budget_amount DECIMAL(15, 2) NOT NULL CHECK (budget_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, month, year)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_planners_user_id ON planners(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners ENABLE ROW LEVEL SECURITY;

-- Users: hanya bisa lihat data sendiri
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true); -- Akses dari server dengan service_role key

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Categories: user hanya akses kategori miliknya
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (true); -- Dihandle di API layer

-- Expenses: user hanya akses pengeluaran miliknya
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (true); -- Dihandle di API layer

-- Planners: user hanya akses planner miliknya
CREATE POLICY "Users can manage own planners" ON planners
  FOR ALL USING (true); -- Dihandle di API layer

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planners_updated_at BEFORE UPDATE ON planners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: Monthly expense summary
-- ============================================
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT
  e.user_id,
  EXTRACT(YEAR FROM e.date) AS year,
  EXTRACT(MONTH FROM e.date) AS month,
  c.id AS category_id,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  SUM(e.amount) AS total_amount,
  COUNT(e.id) AS transaction_count
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id
GROUP BY e.user_id, year, month, c.id, c.name, c.icon, c.color;