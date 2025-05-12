-- Create teachers table if it doesn't exist
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  qualification TEXT NOT NULL,
  class_id INTEGER REFERENCES classes(id),
  status TEXT NOT NULL DEFAULT 'active',
  hire_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create announcements table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all',
  publish_date TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);