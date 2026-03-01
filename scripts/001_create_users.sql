-- Users table for LawBridge Ethiopia
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'lawyer', 'student')),
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  -- Lawyer-specific fields
  license_number TEXT,
  specialization TEXT,
  years_experience INTEGER,
  bio TEXT,
  hourly_rate NUMERIC(10, 2),
  is_verified BOOLEAN DEFAULT FALSE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Sessions table for token management
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
