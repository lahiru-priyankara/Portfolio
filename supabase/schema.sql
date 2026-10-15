-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR PORTFOLIO & ADMINISTRATION
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- -----------------------------------------------------------------------------
-- Profile & Personal Info
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'yeshini.dev',
  full_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  sub_headline TEXT NOT NULL,
  based_in TEXT DEFAULT 'Sri Lanka',
  is_available BOOLEAN DEFAULT true,
  intro_file_tab TEXT DEFAULT 'intro.js',
  intro_greeting TEXT DEFAULT 'Hi, I''m',
  code_window_title TEXT DEFAULT 'developer.js',
  developer_role TEXT DEFAULT 'Full-Stack Developer',
  developer_stack TEXT[] DEFAULT ARRAY['React', 'Node.js', 'MongoDB', 'Python', 'Java']::TEXT[],
  cta_primary_label TEXT DEFAULT 'View My Work',
  cta_secondary_label TEXT DEFAULT 'Contact Me',
  browser_title TEXT DEFAULT 'Yeshini Wickramasinghe | Full-Stack Developer',
  about_paragraphs TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  email TEXT NOT NULL,
  linkedin_url TEXT,
  github_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- Skills & Categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- e.g., 'frontend/', 'backend/', 'database/', 'tools/', 'design/'
  name TEXT NOT NULL,     -- e.g., 'React', 'Node.js'
  icon TEXT DEFAULT '',   -- Preset key or SVG/class
  level TEXT DEFAULT '',  -- 'Core', 'Advanced', 'Familiar'
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- Projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commit_hash VARCHAR(10) NOT NULL, -- e.g., 'c91a4f'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stack TEXT[] DEFAULT ARRAY[]::TEXT[],
  github_url TEXT NOT NULL,
  demo_url TEXT DEFAULT '#',
  status TEXT DEFAULT 'completed', -- 'ongoing' or 'completed'
  start_date TEXT DEFAULT '',       -- e.g. '2024-03-01'
  end_date TEXT DEFAULT '',         -- e.g. '2024-11-30'
  images TEXT[] DEFAULT ARRAY[]::TEXT[], -- Image collection URLs
  demo_video_url TEXT DEFAULT '',   -- Demo video URL (mp4, webm, youtube, loom)
  tracking_data JSONB DEFAULT '{}'::JSONB, -- GitHub progress & sprint tracking metrics
  contributors JSONB DEFAULT '[]'::JSONB,  -- Contributor mentions (username, name, avatar_url, html_url, contributions)
  is_featured BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- Services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  command TEXT NOT NULL, -- e.g., 'run website-development'
  icon TEXT NOT NULL,    -- e.g., '🌐'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- Messages (Contact Form Submissions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Public read access for portfolio displays
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public skills are readable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public projects are readable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public services are readable by everyone" ON public.services FOR SELECT USING (true);

-- Contact submissions: anyone can insert a message
CREATE POLICY "Public can submit contact messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Admin CRUD: authenticated users (via Supabase Auth) or service_role can manage all tables
CREATE POLICY "Authenticated users can manage profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage messages" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. SEED INITIAL DATA

-- Profile
INSERT INTO public.profiles (
  full_name,
  headline,
  sub_headline,
  based_in,
  is_available,
  about_paragraphs,
  tags,
  email,
  linkedin_url,
  github_url
) VALUES (
  'Yeshini Wickramasinghe',
  'IT Undergraduate & Full-Stack Developer.',
  'I build clean, responsive web apps — from React front-ends to Node & MongoDB back-ends — and I take on freelance projects for clients who need reliable, well-documented code.',
  'Sri Lanka',
  true,
  ARRAY[
    'I''m an IT undergraduate who enjoys turning ideas into working software — mostly web apps, mostly full-stack. I like the part of development where a messy requirement becomes a clean, usable interface, and I care about writing code that the next developer (often future me) can actually read.',
    'Outside coursework, I take on freelance and personal projects to keep building things end to end — from database design to the last pixel of the UI. I''m comfortable working solo with a client directly, or slotting into an existing codebase.'
  ],
  ARRAY['IT Undergraduate', 'Freelance Developer', 'Sri Lanka', 'Open to Work'],
  'yeshiniarchana@gmail.com',
  'https://linkedin.com/in/yeshini',
  'https://github.com/YeshiniWckramasinghe'
) ON CONFLICT DO NOTHING;

-- Skills
INSERT INTO public.skills (category, name, sort_order) VALUES
  ('frontend/', 'HTML.html', 1),
  ('frontend/', 'CSS.css', 2),
  ('frontend/', 'JavaScript.js', 3),
  ('frontend/', 'React.jsx', 4),
  ('backend/', 'Node.js', 5),
  ('backend/', 'MongoDB.db', 6),
  ('languages/', 'Python.py', 7),
  ('languages/', 'Java.java', 8),
  ('tooling/', 'GitHub.git', 9)
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO public.projects (commit_hash, name, description, stack, github_url, demo_url, sort_order) VALUES
  (
    'c91a4f',
    'StudyFlow — Student Study Planner',
    'A full-stack app for managing academic subjects, assignments, and deadlines, with a real-time progress dashboard, a RESTful API on MongoDB, priority-based task management, and dark/light theming.',
    ARRAY['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    'https://github.com/YeshiniWckramasinghe/studyflow',
    '#',
    1
  ),
  (
    'a3f9c1',
    'Seagills Lanka — Food Delivery System',
    'A centralized platform to manage all parcel delivery operations — customers place delivery requests and track items in real time, while delivery staff and admins coordinate tasks for faster, accurate service.',
    ARRAY['MongoDB', 'Express', 'Angular', 'React', 'Node.js'],
    'https://github.com/YeshiniWckramasinghe/Seagills-Lanka-foodDelivery-system',
    '#',
    2
  ),
  (
    '7be201',
    'UniMart — Student Marketplace',
    'A marketplace where university students can buy and sell items within campus, with listings, search, and messaging between buyers and sellers.',
    ARRAY['React', 'Node.js', 'MongoDB'],
    'https://github.com/YeshiniWckramasinghe/UniMart',
    '#',
    3
  ),
  (
    'd418e7',
    'Wildlife Safari Management System',
    'Contributed to requirements analysis and system design — use case diagrams, CRC cards, and class diagrams — and helped build modules for user management, booking, payments, and notifications.',
    ARRAY['HTML', 'CSS', 'PHP', 'Git', 'GitHub'],
    'https://github.com/YeshiniWckramasinghe/Jungle-Book-Safari-Tours',
    '#',
    4
  ),
  (
    'f02c56',
    'Rental Vehicle Management System',
    'Implemented booking management and vehicle maintenance scheduling features, and took part in system testing, debugging, and technical documentation to keep the system reliable.',
    ARRAY['HTML', 'CSS3', 'JavaScript', 'Java', 'MySQL', 'Git', 'GitHub'],
    'https://github.com/YeshiniWckramasinghe/DriveSwift-Java-Online-Vehicle-Rental-System-',
    '#',
    5
  )
ON CONFLICT DO NOTHING;

-- Services
INSERT INTO public.services (command, icon, title, description, sort_order) VALUES
  ('run website-development', '🌐', 'Website Development', 'Full websites built from scratch — planning, structure, and code, ready to deploy.', 1),
  ('run frontend-development', '💻', 'Frontend Development', 'Interactive UIs in React or plain JS, built from designs or from a rough idea.', 2),
  ('run bug-fixing', '🔧', 'Bug Fixing', 'Tracking down and fixing issues in existing codebases, with clear notes on the cause.', 3),
  ('run responsive-design', '📱', 'Responsive Web Design', 'Layouts that work cleanly on mobile, tablet, and desktop — no breakpoints left behind.', 4),
  ('run api-integration', '🔗', 'API Integration', 'Connecting your app to third-party APIs or building your own for it to consume.', 5)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. MIGRATION FOR EXISTING DEPLOYMENTS: Add system & intro customization columns
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'yeshini.dev';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_file_tab TEXT DEFAULT 'intro.js';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_greeting TEXT DEFAULT 'Hi, I''m';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS code_window_title TEXT DEFAULT 'developer.js';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS developer_role TEXT DEFAULT 'Full-Stack Developer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS developer_stack TEXT[] DEFAULT ARRAY['React', 'Node.js', 'MongoDB', 'Python', 'Java']::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cta_primary_label TEXT DEFAULT 'View My Work';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT DEFAULT 'Contact Me';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS browser_title TEXT DEFAULT 'Yeshini Wickramasinghe | Full-Stack Developer';

-- Extended About.jsx Customization Columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_file_tab TEXT DEFAULT 'About.jsx';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_title_prefix TEXT DEFAULT 'A little';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_title_highlight TEXT DEFAULT 'about me';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_title TEXT DEFAULT 'inspector.profile';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_education TEXT DEFAULT 'BSc (Hons) in Information Technology';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_focus TEXT DEFAULT 'Full-Stack Web Engineering';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_experience TEXT DEFAULT 'Freelance & Academic Projects';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_items JSONB DEFAULT '[]'::JSONB;

-- Skills Migration: Add icon badge preset key and skill level
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '';

-- Projects Migration: Add status, dates, media collections, video, and GitHub tracking
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_video_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tracking_data JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contributors JSONB DEFAULT '[]'::JSONB;


