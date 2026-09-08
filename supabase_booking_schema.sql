-- ==============================================================================
-- Supabase SQL Table Schema for-- ARNE Stories - Consolidated Supabase Schema & Verification
-- Project ID: yjgbzipdvhgdftxdlccx
-- ==============================================================================

-- 1. Create the `bookings` table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    customer_name TEXT,
    client_email TEXT NOT NULL,
    customer_email TEXT,
    client_phone TEXT NOT NULL,
    customer_phone TEXT,
    customer_whatsapp TEXT,
    service_type TEXT NOT NULL,
    service_name TEXT,
    booking_date TEXT,
    booking_time TEXT,
    time_slot TEXT,
    project_desc TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
    booking_status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'Review Pending',
    confirmation_token TEXT, -- Cryptographic one-time token for owner confirmation (nullified once confirmed)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for high-speed queries and token verification
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings (client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON public.bookings (confirmation_token);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings (created_at DESC);

-- 3. Customers Directory Table (Sync client profile)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    mobile TEXT,
    whatsapp TEXT,
    email TEXT UNIQUE NOT NULL,
    total_bookings INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow public anon insert (for clients making bookings from the frontend)
CREATE POLICY "Allow public anon inserts to bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public anon select (for checking booking status or confirmation)
CREATE POLICY "Allow public anon select from bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow updates for token-based confirmation
CREATE POLICY "Allow anon updates for confirmation"
ON public.bookings
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow public anon inserts/select to customers directory
CREATE POLICY "Allow public anon access to customers"
ON public.customers
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
