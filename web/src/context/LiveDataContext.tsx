import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Course, Destination, Testimonial, Lead, Appointment } from '../types';
import { COURSES, DESTINATIONS, TESTIMONIALS } from '../data/mockData';

interface LiveDataContextType {
  courses: Course[];
  destinations: Destination[];
  testimonials: Testimonial[];
  leads: Lead[];
  appointments: Appointment[];
  banners: Banner[];
  loading: boolean;
  isSupabaseConnected: boolean;
  refreshData: () => Promise<void>;
  
  // Courses CRUD
  addCourse: (course: Omit<Course, 'id'>) => Promise<boolean>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;

  // Destinations CRUD
  addDestination: (dest: Destination) => Promise<boolean>;
  updateDestination: (slug: string, dest: Partial<Destination>) => Promise<boolean>;
  deleteDestination: (slug: string) => Promise<boolean>;

  // Testimonials CRUD
  addTestimonial: (item: Omit<Testimonial, 'id'>) => Promise<boolean>;
  updateTestimonial: (id: string, item: Partial<Testimonial>) => Promise<boolean>;
  deleteTestimonial: (id: string) => Promise<boolean>;

  // Banner CRUD
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<boolean>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<boolean>;
  deleteBanner: (id: string) => Promise<boolean>;

  // Leads & Appointments operations
  addAppointment: (appt: Omit<Appointment, 'id'> & { id?: string }) => Promise<Appointment>;
  getAppointmentByCodeOrPhone: (query: string) => Appointment | undefined;
  updateLeadStatus: (id: string, status: Lead['status'], notes?: string) => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], notes?: string) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [destinations, setDestinations] = useState<Destination[]>(DESTINATIONS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!coursesError && coursesData && coursesData.length > 0) {
        setCourses(coursesData);
        setIsSupabaseConnected(true);
      }

      // 2. Fetch Destinations
      const { data: destData, error: destError } = await supabase
        .from('destinations')
        .select('*');

      if (!destError && destData && destData.length > 0) {
        const mappedDest: Destination[] = destData.map((d: any) => ({
          country_name: d.country_name,
          slug: d.slug,
          capital: d.capital || 'Capital',
          currency: d.currency || 'USD',
          avg_living_cost: d.avg_living_cost || 'Moderate',
          work_rights: d.work_rights || 'Standard',
          visa_subclass: d.visa_subclass || 'Student Visa',
          overview: d.overview || '',
          visa_process: Array.isArray(d.visa_process) ? d.visa_process : (d.visa_process ? d.visa_process.split('\n') : []),
          admission_requirements: d.admission_requirements || '',
          top_universities: Array.isArray(d.top_universities) ? d.top_universities : (d.top_universities ? d.top_universities.split('\n') : ['Top Universities']),
          flag: d.flag || '🌏',
          imageUrl: d.imageUrl,
        }));
        setDestinations(mappedDest);
        setIsSupabaseConnected(true);
      }

      // 3. Fetch Testimonials
      const { data: testData, error: testError } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!testError && testData && testData.length > 0) {
        setTestimonials(testData);
        setIsSupabaseConnected(true);
      }
      
      // Fetch Banners
      const { data: bannerData, error: bannerError } = await supabase
        .from('banners')
        .select('*');
        
      if (!bannerError && bannerData) {
        setBanners(bannerData);
      }

      // 4. Fetch Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!leadsError && leadsData) {
        setLeads(leadsData);
        setIsSupabaseConnected(true);
      }

      // 5. Fetch Appointments
      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!apptError && apptData) {
        setAppointments(apptData);
        setIsSupabaseConnected(true);
      }
    } catch (err) {
      console.info('Live data fetch notice (fallback active):', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Banner operations
  const addBanner = async (newBanner: Omit<Banner, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const bannerWithId = { ...newBanner, id: tempId };
    setBanners((prev) => [...prev, bannerWithId]);

    try {
      const { data, error } = await supabase.from('banners').insert([newBanner]).select().single();
      if (!error && data) {
        setBanners((prev) => prev.map((b) => (b.id === tempId ? data : b)));
        return true;
      }
    } catch (e) {
      console.warn('Sync notice for addBanner:', e);
    }
    return true;
  };

  const updateBanner = async (id: string, updated: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    try {
      await supabase.from('banners').update(updated).eq('id', id);
    } catch (e) {
      console.warn('Sync notice for updateBanner:', e);
    }
    return true;
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await supabase.from('banners').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync notice for deleteBanner:', e);
    }
    return true;
  };

  // ... (existing CRUD operations)

  return (
    <LiveDataContext.Provider
      value={{
        courses,
        destinations,
        testimonials,
        banners,
        leads,
        appointments,
        loading,
        isSupabaseConnected,
        refreshData: fetchData,
        addCourse,
        updateCourse,
        deleteCourse,
        addDestination,
        updateDestination,
        deleteDestination,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        addBanner,
        updateBanner,
        deleteBanner,
        updateLeadStatus,
        deleteLead,
        addAppointment,
        getAppointmentByCodeOrPhone,
        updateAppointmentStatus,
        deleteAppointment,
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
};


export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error('useLiveData must be used within a LiveDataProvider');
  }
  return context;
};
