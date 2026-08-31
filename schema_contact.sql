-- ====================================================================
-- ARNE Works — Supabase 'users' Contact Form Table Migration Script
-- Project ID: xmnjhfkzvbssuajgxnvf
-- Run this script in your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run)
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'users' Table for Contact Form Submissions
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Anon Public Submissions and Selects
CREATE POLICY "Allow public insert to users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from users" ON public.users FOR SELECT USING (true);
