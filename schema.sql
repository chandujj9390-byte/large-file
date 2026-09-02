-- ====================================================================
-- ARNE Works — Supabase Database Migration & SQL Setup Script
-- Project ID: xmnjhfkzvbssuajgxnvf
-- Run this complete script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    starting_from BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    company TEXT,
    location TEXT,
    total_bookings INTEGER DEFAULT 1,
    total_spent NUMERIC(10,2) DEFAULT 0,
    pending_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Slots / Availability Table
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'BOOKED', 'BLOCKED'
    max_bookings INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_date_time UNIQUE (slot_date, time_slot)
);

-- 5. Bookings Table (Stores Customer Form Submissions)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY, -- e.g. 'ARNE-2026-849201' or UUID string
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_whatsapp TEXT,
    customer_email TEXT,
    company TEXT,
    location TEXT,
    service_type TEXT,
    service_name TEXT,
    project_desc TEXT,
    booking_date DATE,
    booking_time TEXT,
    time_slot TEXT,
    total_price NUMERIC(10,2) DEFAULT 0,
    prepaid_amount NUMERIC(10,2) DEFAULT 0,
    postpaid_amount NUMERIC(10,2) DEFAULT 0,
    amount_paid NUMERIC(10,2) DEFAULT 0,
    amount_remaining NUMERIC(10,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'UPI',
    status TEXT DEFAULT 'confirmed',
    booking_status TEXT DEFAULT 'Confirmed',
    payment_status TEXT DEFAULT 'Pending',
    ref_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already created earlier
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='client_name') THEN
        ALTER TABLE public.bookings ADD COLUMN client_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='client_email') THEN
        ALTER TABLE public.bookings ADD COLUMN client_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='client_phone') THEN
        ALTER TABLE public.bookings ADD COLUMN client_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_time') THEN
        ALTER TABLE public.bookings ADD COLUMN booking_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='service_type') THEN
        ALTER TABLE public.bookings ADD COLUMN service_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='status') THEN
        ALTER TABLE public.bookings ADD COLUMN status TEXT DEFAULT 'confirmed';
    END IF;
END $$;

-- 6. Payments Ledger Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    prepaid_amount NUMERIC(10,2) NOT NULL,
    postpaid_amount NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    amount_remaining NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Partially Paid',
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications Log Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contact Form Submissions Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Row Level Security (RLS) Policies (Allows anon insert & select)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Grant Anon Public Insert and Select Permissions
CREATE POLICY "Allow public select services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select slots" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Allow public insert slots" ON public.slots FOR INSERT WITH CHECK (true);

-- 10. Seed Initial Services & Data
INSERT INTO public.services (id, name, category, price, starting_from, active, description) VALUES
('srv-1', 'Video Editing', 'Video Production', 1049, false, true, 'Professional 4K video editing, color grading, sound design, and motion titles.'),
('srv-2', 'Photo Editing', 'Photography', 599, false, true, 'High-end portrait retouching, skin smoothing, and color correction.'),
('srv-3', 'Reel / Shorts Editing', 'Social Media', 799, false, true, 'Engaging vertical reel editing with viral captions, hooks, and trend transitions.'),
('srv-4', 'Poster Designing', 'Graphic Design', 529, false, true, 'Cinematic poster art, movie key art, and promotional graphics.'),
('srv-5', 'Album Designing', 'Graphic Design', 1299, true, true, 'Premium photo album layout design for weddings, events, and brand portfolios.'),
('srv-6', 'Color Grading', 'Post Production', 599, false, true, 'LUT development, DaVinci Resolve color matching, and cinematic film looks.'),
('srv-7', 'Cinematic Shoot', 'Videography', 4999, true, true, 'Full 4K cinema camera production shoot with gimbal lighting and director.'),
('srv-8', 'Website Designing', 'Web Development', 4999, true, true, 'Custom high-speed responsive website design with glassmorphism UI.')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;
