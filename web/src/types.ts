export type LeadStatus = 'New' | 'Contacted' | 'In Progress' | 'Converted' | 'Closed';

export type AppointmentMode = 'Office' | 'Online';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed';

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  destination: string;
  course_interest?: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  email: string;
  phone: string;
  destination: string;
  appointment_date: string;
  time_slot: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  message?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  category_slug: string;
  country: string;
  duration: string;
  estimated_fees: string;
  intake_months: string;
  description: string;
  career_paths: string;
}

export interface CourseCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface Destination {
  country_name: string;
  slug: string;
  capital: string;
  currency: string;
  avg_living_cost: string;
  work_rights: string;
  visa_subclass: string;
  overview: string;
  visa_process: string[];
  admission_requirements: string;
  top_universities: string[];
  flag: string;
}

export interface Testimonial {
  id: string;
  student_name: string;
  name?: string;
  university: string;
  country: string;
  quote: string;
  rating: number;
  year: string;
}
