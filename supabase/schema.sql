-- ========================================================================
-- SR Global Consultants - Production Supabase Schema
-- Education & Migration Consultancy Backend (PostgreSQL + RLS)
-- ========================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. ROLES & PERMISSIONS HELPER
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff', 'student')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Security Definer function to avoid recursive RLS checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    );
$$;

-- Function to check if user has any administrative authority
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('super_admin', 'admin', 'staff')
    );
$$;

-- ------------------------------------------------------------------------
-- 2. PUBLIC INQUIRIES & APPOINTMENTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    course_interest TEXT,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Converted', 'Closed')),
    source TEXT DEFAULT 'Android App',
    notes TEXT,
    follow_up_date DATE,
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Office' CHECK (mode IN ('Online', 'Office')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique index to prevent double-booking active appointment slots
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_appointment_slot
ON public.appointments (appointment_date, time_slot)
WHERE status IN ('Pending', 'Confirmed');

CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday, 7 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_bookings INT DEFAULT 1
);

-- ------------------------------------------------------------------------
-- 3. STUDENTS & CASE APPLICATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    passport_number TEXT,
    target_country TEXT NOT NULL,
    visa_stage TEXT DEFAULT 'Counseling Stage',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
    remarks TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    location TEXT,
    website TEXT,
    logo_url TEXT,
    ranking TEXT,
    is_partner BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    course_title TEXT NOT NULL,
    intake_term TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Offer Received', 'COE Received', 'Visa Lodged', 'Visa Granted', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 4. COURSES & STUDY DESTINATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category_slug TEXT NOT NULL REFERENCES public.course_categories(slug) ON DELETE CASCADE,
    country TEXT NOT NULL,
    duration TEXT NOT NULL,
    estimated_fees TEXT NOT NULL,
    intake_months TEXT NOT NULL,
    description TEXT NOT NULL,
    career_paths TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    capital TEXT,
    currency TEXT,
    avg_living_cost TEXT,
    work_rights TEXT,
    visa_subclass TEXT,
    overview TEXT NOT NULL,
    visa_process TEXT NOT NULL,
    admission_requirements TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 5. CONTENT, TESTIMONIALS & SITE SETTINGS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    author_name TEXT DEFAULT 'SR Global Team',
    published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    university TEXT NOT NULL,
    country TEXT NOT NULL,
    photo_url TEXT,
    quote TEXT NOT NULL,
    rating INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active catalogs & settings
CREATE POLICY "Public read active categories" ON public.course_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read active courses" ON public.courses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read active destinations" ON public.destinations FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read partner universities" ON public.universities FOR SELECT USING (TRUE);
CREATE POLICY "Public read published posts" ON public.blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (is_featured = TRUE);
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (TRUE);

-- Public leads & appointments submission (Insert only, cannot read other leads)
CREATE POLICY "Public can submit leads" ON public.leads FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can book appointments" ON public.appointments FOR INSERT WITH CHECK (TRUE);
-- Public can view slot times to detect booked slots
CREATE POLICY "Public check slot availability" ON public.appointments FOR SELECT USING (status IN ('Pending', 'Confirmed'));

-- Staff & Admin have comprehensive access
CREATE POLICY "Staff view and update leads" ON public.leads FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff manage appointments" ON public.appointments FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff manage students" ON public.students FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff manage applications" ON public.applications FOR ALL
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin manage catalog courses" ON public.courses FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin manage destinations" ON public.destinations FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- ------------------------------------------------------------------------
-- 7. INITIAL SEED DATA FOR SR GLOBAL CONSULTANTS
-- ------------------------------------------------------------------------
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('company_profile', '{
    "name": "SR Global Consultants",
    "tagline": "Your Gateway to Global Education & Migration Success",
    "address": "1st Floor, 239A Civic Center, Gujranwala, Pakistan",
    "latitude": 32.1841449,
    "longitude": 74.1809924,
    "phone_pk": "+92 327 8321560",
    "phone_au": "+61 415 331872",
    "email": "contact@srglobalconsultants.com",
    "social": {
        "facebook": "https://facebook.com/srglobalconsultants",
        "twitter": "https://twitter.com/srglobalconsult",
        "linkedin": "https://linkedin.com/in/srglobalconsult"
    },
    "metrics": {
        "students_guided": 5200,
        "partner_universities": 160,
        "visa_success_rate": 98.4,
        "years_experience": 12
    }
}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

INSERT INTO public.course_categories (slug, name, description, display_order) VALUES
('trade-courses', 'Trade Courses', 'Practical apprenticeships & high-demand skilled trades (Carpentry, Automotive, Cookery)', 1),
('vocational-courses', 'Vocational Courses', 'VET programs, Diplomas & Advanced Diplomas bridging to employment', 2),
('higher-education', 'Higher Education Sector', 'Undergraduate, Master’s and Doctoral Degree pathways', 3),
('short-courses', 'Short Courses', 'Specialized skill certifications and professional refreshers', 4),
('high-risk-courses', 'High-Risk Courses', 'Certifications for high-demand industrial & safety sectors', 5),
('aqf-australia', 'AQF Australia', 'Australian Qualifications Framework accredited pathway certifications', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.destinations (country_name, slug, capital, currency, avg_living_cost, work_rights, visa_subclass, overview, visa_process, admission_requirements) VALUES
('Australia', 'australia', 'Canberra', 'AUD ($)', 'AUD 21,000 - 24,500 / year', '48 hours per fortnight during study; unlimited in breaks', 'Subclass 500', 
'Australia is a premier destination known for top-tier Group of Eight universities, exceptional quality of life, and post-study work streams.',
'1. Select course & receive Offer Letter\n2. Pay tuition deposit & obtain eCoE\n3. Undergo health examination & biometrics\n4. Lodge Subclass 500 online with Genuine Student (GS) statement',
'IELTS 6.0-6.5 overall (PTE 50-58), minimum 60% academic records, financial proof of tuition and living expenses.'),

('United Kingdom', 'united-kingdom', 'London', 'GBP (£)', 'GBP 12,000 - 15,000 / year', '20 hours per week during term time', 'Student Visa (Route)',
'The UK provides prestigious Russell Group institutions with accelerated 1-year Master degrees and a 2-year Graduate Route post-study work visa.',
'1. University Application & CAS issuance\n2. Maintenance funds in account for 28 consecutive days\n3. TB screening & Visa application\n4. Biometrics appointment at VFS',
'IELTS 6.0-6.5, minimum 55-60% graduation score, valid CAS from licensed sponsor.'),

('United States', 'usa', 'Washington, D.C.', 'USD ($)', 'USD 14,000 - 18,000 / year', 'On-campus 20 hrs/week; OPT/CPT available', 'F-1 Student Visa',
'Home to Ivy League excellence, expansive research budgets, and flexible curricular degree options with up to 3-year STEM OPT extensions.',
'1. Gain admission & receive Form I-20\n2. Pay SEVIS I-901 fee\n3. Complete DS-160 application\n4. Attend US Embassy in-person visa interview',
'TOEFL/IELTS/Duolingo, SAT/GRE (optional depending on university), bank statements demonstrating full 1st-year funds.'),

('Canada', 'canada', 'Ottawa', 'CAD ($)', 'CAD 15,000 - 20,000 / year', '20-24 hours per week during studies', 'Study Permit',
'Renowned for welcoming immigration policies, affordable tuition fees, Post-Graduation Work Permits (PGWP), and vibrant multicultural cities.',
'1. Letter of Acceptance (LOA) from DLI\n2. Provincial Attestation Letter (PAL)\n3. Purchase GIC ($20,635 CAD)\n4. Submit online study permit application',
'IELTS 6.0 (or PTE equivalent), secondary school diploma or bachelor degree with 60%+ average.'),

('Europe', 'europe', 'Various', 'EUR (€)', 'EUR 8,000 - 12,000 / year', 'Varies by country (typically 15-20 hrs/wk)', 'National D Student Visa',
'Affordable to tuition-free education in Germany, Italy, Sweden, and Ireland, offering English-taught programs in technology and management.',
'1. University admission letter\n2. Blocked account setup (e.g. Germany)\n3. Embassy document attestation\n4. Visa appointment & issuance',
'IELTS 6.0 or English proficiency letter, apostilled educational certificates.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.courses (title, category_slug, country, duration, estimated_fees, intake_months, description, career_paths) VALUES
('Diploma of Commercial Cookery & Hospitality', 'trade-courses', 'Australia', '2 Years', 'AUD 12,000 - 16,000/yr', 'Feb, July, Oct', 'Hands-on kitchen operations, food safety, inventory control, and culinary leadership aligned with Australian Chef migration pathways.', 'Chef de Partie, Sous Chef, Restaurant Manager'),
('Diploma of Automotive Technology', 'trade-courses', 'Australia', '2 Years', 'AUD 13,500/yr', 'Jan, April, July', 'Comprehensive diagnostic and mechanical training on modern light and heavy commercial vehicles.', 'Automotive Technician, Workshop Supervisor'),
('Advanced Diploma of Information Technology', 'vocational-courses', 'Australia', '1.5 - 2 Years', 'AUD 11,000/yr', 'March, August', 'Cloud computing, networking, cybersecurity fundamentals, and enterprise systems implementation.', 'Network Administrator, Systems Support Specialist'),
('Master of Business Administration (Global)', 'higher-education', 'United Kingdom', '1 Year', 'GBP 14,500', 'Jan, Sept', 'Strategic leadership, international finance, and corporate management tailored for ambitious executives.', 'Business Consultant, Operations Director'),
('Bachelor of Computer Science & Software Engineering', 'higher-education', 'Canada', '4 Years', 'CAD 18,000/yr', 'Sept, Jan', 'Algorithms, full-stack software development, machine learning, and high-performance computing.', 'Software Engineer, Data Analyst, Cloud Architect'),
('Certificate IV in Building & Construction', 'aqf-australia', 'Australia', '1 Year', 'AUD 9,500', 'Monthly Intakes', 'AQF Level 4 certification covering Australian residential and commercial construction codes and safety standards.', 'Site Supervisor, Building Inspector')
ON CONFLICT DO NOTHING;

INSERT INTO public.testimonials (student_name, university, country, quote, rating) VALUES
('Hamza Tariq', 'University of Melbourne', 'Australia', 'SR Global Consultants made my dream of studying in Australia a reality. Their team in Gujranwala guided my Subclass 500 visa and SOP with meticulous precision. Approved in just 14 days!', 5),
('Ayesha Malik', 'University of Manchester', 'United Kingdom', 'From IELTS coaching to CAS processing and university selection, Sir Ghulam Mustafa and his team provided exceptional support. Highly recommended for sincere guidance.', 5),
('Usman Farooq', 'Conestoga College', 'Canada', 'I was worried about my study gap, but the counselors at SR Global structured my Canadian study permit application flawlessly. Got my visa with full PGWP eligibility!', 5)
ON CONFLICT DO NOTHING;
