import { Course, CourseCategory, Destination, Testimonial } from '../types';

export const COMPANY_CONTACT = {
  name: 'SR Global Consultants',
  tagline: 'Your Gateway to Global Education & Migration Success',
  address: '1st Floor, 239A Civic Center, Gujranwala, Pakistan',
  latitude: 32.1841449,
  longitude: 74.1809924,
  phonePakistan: '+92 327 8321560',
  phoneAustralia: '+61 415 331872',
  email: 'contact@srglobalconsultants.com',
  whatsappNumber: '923278321560',
  officeHours: 'Monday - Saturday: 10:00 AM - 6:00 PM (PKT)',
  facebook: 'https://facebook.com/srglobalconsultants',
  twitter: 'https://twitter.com/srglobalconsult',
  linkedin: 'https://linkedin.com/in/srglobalconsult'
};

export const SITE_METRICS = {
  studentsGuided: 5200,
  partnerUniversities: 160,
  visaSuccessRate: '98.4%',
  yearsExperience: '12+'
};

export const COURSE_CATEGORIES: CourseCategory[] = [
  { slug: 'trade-courses', name: 'Trade Courses', description: 'Hands-on chef, automotive, and building apprenticeships aligned with Australian PR pathways.', count: 8 },
  { slug: 'vocational-courses', name: 'Vocational Courses', description: 'Diplomas and Advanced Diplomas in IT, Business, Cloud, and Community Services.', count: 12 },
  { slug: 'higher-education', name: 'Higher Education Sector', description: 'Recognized Bachelor, Master, and PhD programs across the UK, USA, Australia, and Canada.', count: 15 },
  { slug: 'short-courses', name: 'Short Courses & Test Prep', description: 'IELTS / PTE Academic training masterclasses and professional certificates.', count: 6 },
  { slug: 'high-risk-courses', name: 'High-risk Courses', description: 'Accredited industrial certifications (Forklift, Rigging, Scaffolding) for mining & logistics.', count: 4 },
  { slug: 'aqf-australia', name: 'AQF Australia', description: 'Australian Qualifications Framework accredited pathway certifications.', count: 10 }
];

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Diploma of Commercial Cookery & Hospitality Management',
    category_slug: 'trade-courses',
    country: 'Australia',
    duration: '2 Years',
    estimated_fees: 'AUD 13,000 - 16,500 / year',
    intake_months: 'February, July, October',
    description: 'Comprehensive practical kitchen training covering food safety standards, menu engineering, modern culinary leadership, and restaurant operations aligned with Australian chef trade migration.',
    career_paths: 'Chef de Partie, Sous Chef, Kitchen Executive, Restaurant Owner'
  },
  {
    id: '2',
    title: 'Certificate III & IV in Heavy Commercial Vehicle Mechanical Technology',
    category_slug: 'trade-courses',
    country: 'Australia',
    duration: '2 Years',
    estimated_fees: 'AUD 14,000 / year',
    intake_months: 'January, April, July',
    description: 'Extensive workshop mechanical diagnostic software, engine overhaul, electrical troubleshooting, and braking systems for light and heavy transport fleets.',
    career_paths: 'Automotive Mechanic, Workshop Supervisor, Fleet Technician'
  },
  {
    id: '3',
    title: 'Advanced Diploma of Information Technology (Cyber Security & Cloud)',
    category_slug: 'vocational-courses',
    country: 'Australia',
    duration: '1.5 - 2 Years',
    estimated_fees: 'AUD 11,500 / year',
    intake_months: 'March, July, November',
    description: 'Hands-on enterprise networking, cloud virtualization (AWS/Azure), ethical hacking, threat mitigation, and disaster recovery architectures.',
    career_paths: 'Cybersecurity Analyst, Cloud Systems Engineer, Network Administrator'
  },
  {
    id: '4',
    title: 'Master of Business Administration (Global Leadership)',
    category_slug: 'higher-education',
    country: 'United Kingdom',
    duration: '1 Year Fast-Track',
    estimated_fees: 'GBP 13,500 - 16,000',
    intake_months: 'January, September',
    description: 'Fast-track prestigious MBA focusing on global finance, strategic corporate management, cross-border operations, and eligibility for the 2-year UK Graduate Route visa.',
    career_paths: 'Management Consultant, Business Operations Director, Investment Associate'
  },
  {
    id: '5',
    title: 'Bachelor of Science in Computer Science & Artificial Intelligence',
    category_slug: 'higher-education',
    country: 'Canada',
    duration: '4 Years (with Co-op)',
    estimated_fees: 'CAD 18,500 / year',
    intake_months: 'September, January',
    description: 'Foundational algorithms, distributed database architecture, machine learning models, and paid industry co-op placements with Canadian technology employers.',
    career_paths: 'Software Engineer, Full Stack Developer, AI/ML Specialist'
  },
  {
    id: '6',
    title: 'Certificate IV in Building & Construction (Building)',
    category_slug: 'aqf-australia',
    country: 'Australia',
    duration: '1 Year',
    estimated_fees: 'AUD 9,800',
    intake_months: 'Monthly Intakes',
    description: 'AQF Level 4 certified qualification providing complete knowledge of Australian building codes, structural estimation, occupational health and site subcontractor management.',
    career_paths: 'Building Site Supervisor, Project Estimator, Construction Contractor'
  }
];

export const DESTINATIONS: Destination[] = [
  {
    country_name: 'Australia',
    slug: 'australia',
    capital: 'Canberra',
    currency: 'AUD ($)',
    avg_living_cost: 'AUD 21,000 - 24,500 / yr',
    work_rights: '48 hours per fortnight during study; unlimited in breaks',
    visa_subclass: 'Subclass 500 Student Visa',
    overview: 'Australia offers world-renowned Go8 universities, exceptional quality of life, and generous post-study work rights (Subclass 485). A top choice for students seeking trade, vocational, and higher education qualifications.',
    visa_process: [
      'Course counseling & admission offer letter issuance',
      'Preparation of Genuine Student (GS) statement',
      'Tuition deposit payment & electronic Confirmation of Enrolment (eCoE)',
      'Panel medical examination & biometric capture',
      'Online Subclass 500 visa lodgement via ImmiAccount'
    ],
    admission_requirements: 'Minimum 60% academic score in prior qualifications; IELTS 6.0-6.5 overall (or PTE Academic 50-58); verified proof of financial capacity.',
    top_universities: ['University of Melbourne', 'University of Sydney', 'Monash University', 'RMIT University', 'University of Queensland'],
    flag: '🇦🇺'
  },
  {
    country_name: 'United Kingdom',
    slug: 'united-kingdom',
    capital: 'London',
    currency: 'GBP (£)',
    avg_living_cost: 'GBP 12,000 - 15,000 / yr',
    work_rights: '20 hours per week during term time',
    visa_subclass: 'Student Visa (Points-based System)',
    overview: 'Home to historic institutions with accelerated 1-year Master degrees and the 2-year Graduate Route post-study work visa. Ideal for business, technology, and engineering students.',
    visa_process: [
      'University admission and CAS (Confirmation of Acceptance for Studies)',
      '28-day consecutive maintenance fund bank holding',
      'Tuberculosis (TB) medical screening at IOM accredited clinic',
      'Online visa submission, IHS health surcharge payment, and VFS biometrics'
    ],
    admission_requirements: 'Minimum 55-60% graduation score; IELTS 6.0-6.5 or equivalent PTE score; strong Statement of Purpose (SOP).',
    top_universities: ['University of Oxford', 'University of Manchester', 'University of Birmingham', 'King\'s College London', 'University of Leeds'],
    flag: '🇬🇧'
  },
  {
    country_name: 'United States',
    slug: 'usa',
    capital: 'Washington, D.C.',
    currency: 'USD ($)',
    avg_living_cost: 'USD 14,000 - 18,000 / yr',
    work_rights: '20 hours per week on-campus; up to 3-year STEM OPT',
    visa_subclass: 'F-1 Student Visa',
    overview: 'The international leader in research funding, flexible curricula, and innovative enterprise partnerships. STEM students can work in the US for up to 3 years post-graduation.',
    visa_process: [
      'University acceptance and Form I-20 issuance',
      'Online SEVIS I-901 fee payment',
      'DS-160 online visa application form submission',
      'In-person visa interview appointment at the US Embassy in Islamabad'
    ],
    admission_requirements: 'Minimum GPA 2.8-3.0 / 60%; TOEFL iBT 80+ or IELTS 6.5+; bank statement covering first-year tuition and living expenses.',
    top_universities: ['MIT', 'Stanford University', 'New York University', 'University of Texas at Austin', 'Arizona State University'],
    flag: '🇺🇸'
  },
  {
    country_name: 'Canada',
    slug: 'canada',
    capital: 'Ottawa',
    currency: 'CAD ($)',
    avg_living_cost: 'CAD 15,000 - 20,635 / yr',
    work_rights: '20-24 hours per week during semester',
    visa_subclass: 'Study Permit (IRCC)',
    overview: 'Safe, multicultural, and welcoming nation offering competitive tuition fees, Post-Graduation Work Permits (PGWP up to 3 years), and straightforward residency transition pathways.',
    visa_process: [
      'Letter of Acceptance (LOA) and Provincial Attestation Letter (PAL)',
      'Guaranteed Investment Certificate (GIC $20,635 CAD) deposit',
      'Upfront immigration medical examination',
      'Online IRCC study permit submission and VFS biometric appointment'
    ],
    admission_requirements: 'Minimum 60% in prior education; IELTS 6.0 minimum overall; verified funding sources.',
    top_universities: ['University of Toronto', 'UBC Vancouver', 'McGill University', 'Conestoga College', 'Seneca Polytechnic'],
    flag: '🇨🇦'
  },
  {
    country_name: 'Europe',
    slug: 'europe',
    capital: 'Various (Berlin, Rome, Dublin)',
    currency: 'EUR (€)',
    avg_living_cost: 'EUR 8,000 - 12,000 / yr',
    work_rights: '15-20 hours per week depending on host nation',
    visa_subclass: 'National D Long-term Student Visa',
    overview: 'Affordable to tuition-free education in top universities across Germany, Italy, Ireland, and Sweden offering English-taught degrees in management, engineering, and digital arts.',
    visa_process: [
      'University admission letter and enrollment confirmation',
      'Blocked account opening (e.g. Expatrio/Fintiba for Germany)',
      'Overseas health insurance acquisition',
      'Visa appointment at relevant European Embassy'
    ],
    admission_requirements: 'Minimum 60% academic average; IELTS 6.0 or verified English Proficiency Certificate from previous institution.',
    top_universities: ['TU Munich', 'Sapienza University Rome', 'Trinity College Dublin', 'Politecnico di Milano', 'Lund University'],
    flag: '🇪🇺'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    student_name: 'Hamza Tariq',
    university: 'University of Melbourne',
    country: 'Australia',
    quote: 'SR Global Consultants guided my Australian Subclass 500 visa with utter transparency. Sir Ghulam Mustafa and the Gujranwala team structured my SOP brilliantly. Visa granted in just 14 days!',
    rating: 5,
    year: '2025'
  },
  {
    id: '2',
    student_name: 'Ayesha Malik',
    university: 'University of Manchester',
    country: 'United Kingdom',
    quote: 'Outstanding guidance for my Master\'s admission in the UK. From IELTS preparation to the 28-day bank statement review, they monitored every detail. I recommend them with 100% confidence.',
    rating: 5,
    year: '2025'
  },
  {
    id: '3',
    student_name: 'Usman Farooq',
    university: 'Conestoga College',
    country: 'Canada',
    quote: 'Despite having a 3-year study gap after graduation, SR Global demonstrated my career progression so convincingly that IRCC approved my study permit smoothly. Best consultants in Gujranwala!',
    rating: 5,
    year: '2024'
  }
];

export const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM'
];
