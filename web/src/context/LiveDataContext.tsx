import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Course, Destination, Testimonial, Lead, Appointment, Banner } from '../types';
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

  // Course operations
  const addCourse = async (newCourse: Omit<Course, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const courseWithId = { ...newCourse, id: tempId };
    setCourses((prev) => [courseWithId, ...prev]);

    try {
      const { data, error } = await supabase.from('courses').insert([newCourse]).select().single();
      if (!error && data) {
        setCourses((prev) => prev.map((c) => (c.id === tempId ? data : c)));
        return true;
      }
    } catch (e) {
      console.warn('Sync notice for addCourse:', e);
    }
    return true;
  };

  const updateCourse = async (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      await supabase.from('courses').update(updated).eq('id', id);
    } catch (e) {
      console.warn('Sync notice for updateCourse:', e);
    }
    return true;
  };

  const deleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await supabase.from('courses').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync notice for deleteCourse:', e);
    }
    return true;
  };

  // Destination operations
  const addDestination = async (newDest: Destination) => {
    setDestinations((prev) => [...prev, newDest]);
    try {
      await supabase.from('destinations').insert([
        {
          country_name: newDest.country_name,
          slug: newDest.slug,
          capital: newDest.capital,
          currency: newDest.currency,
          avg_living_cost: newDest.avg_living_cost,
          work_rights: newDest.work_rights,
          visa_subclass: newDest.visa_subclass,
          overview: newDest.overview,
          visa_process: newDest.visa_process.join('\n'),
          admission_requirements: newDest.admission_requirements,
          imageUrl: newDest.imageUrl,
        }
      ]);
    } catch (e) {
      console.warn('Sync notice for addDestination:', e);
    }
    return true;
  };

  const updateDestination = async (slug: string, updated: Partial<Destination>) => {
    setDestinations((prev) => prev.map((d) => (d.slug === slug ? { ...d, ...updated } : d)));
    try {
      await supabase.from('destinations').update(updated).eq('slug', slug);
    } catch (e) {
      console.warn('Sync notice for updateDestination:', e);
    }
    return true;
  };

  const deleteDestination = async (slug: string) => {
    setDestinations((prev) => prev.filter((d) => d.slug !== slug));
    try {
      await supabase.from('destinations').delete().eq('slug', slug);
    } catch (e) {
      console.warn('Sync notice for deleteDestination:', e);
    }
    return true;
  };

  // Testimonial operations
  const addTestimonial = async (newItem: Omit<Testimonial, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const itemWithId = { ...newItem, id: tempId, student_name: newItem.student_name };
    setTestimonials((prev) => [itemWithId, ...prev]);

    try {
      const { data, error } = await supabase.from('testimonials').insert([newItem]).select().single();
      if (!error && data) {
        setTestimonials((prev) => prev.map((t) => (t.id === tempId ? data : t)));
      }
    } catch (e) {
      console.warn('Sync notice for addTestimonial:', e);
    }
    return true;
  };

  const updateTestimonial = async (id: string, updated: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    try {
      await supabase.from('testimonials').update(updated).eq('id', id);
    } catch (e) {
      console.warn('Sync notice for updateTestimonial:', e);
    }
    return true;
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync notice for deleteTestimonial:', e);
    }
    return true;
  };

  // Lead status update
  const updateLeadStatus = async (id: string, status: Lead['status'], notes?: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, notes: notes !== undefined ? notes : l.notes } : l))
    );
    try {
      await supabase.from('leads').update({ status, ...(notes !== undefined ? { notes } : {}) }).eq('id', id);
    } catch (e) {
      console.warn('Sync notice for updateLeadStatus:', e);
    }
    return true;
  };

  // Appointment creation with auto appointment_code
  const addAppointment = async (newAppt: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment> => {
    const code = newAppt.appointment_code || `SRG-APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempId = newAppt.id || `appt-${Date.now()}`;
    const fullAppt: Appointment = {
      ...newAppt,
      id: tempId,
      appointment_code: code,
      status: newAppt.status || 'Pending',
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [fullAppt, ...prev]);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          client_name: fullAppt.client_name,
          email: fullAppt.email,
          phone: fullAppt.phone,
          destination: fullAppt.destination,
          appointment_date: fullAppt.appointment_date,
          time_slot: fullAppt.time_slot,
          mode: fullAppt.mode,
          status: fullAppt.status,
          message: fullAppt.message,
          appointment_code: fullAppt.appointment_code,
          notes: fullAppt.notes,
        }])
        .select()
        .single();

      if (!error && data) {
        setAppointments((prev) => prev.map((a) => (a.id === tempId ? data : a)));
        return data;
      }
    } catch (e) {
      console.warn('Sync notice for addAppointment:', e);
    }
    return fullAppt;
  };

  const getAppointmentByCodeOrPhone = (query: string): Appointment | undefined => {
    if (!query) return undefined;
    const cleanQuery = query.trim().toUpperCase();
    const cleanPhone = query.replace(/[^0-9]/g, '');

    return appointments.find((a) => {
      const codeMatch = a.appointment_code?.toUpperCase() === cleanQuery || a.id.toUpperCase() === cleanQuery;
      const phoneMatch = cleanPhone.length >= 7 && a.phone.replace(/[^0-9]/g, '').includes(cleanPhone);
      return codeMatch || phoneMatch;
    });
  };

  // Appointment status update
  const updateAppointmentStatus = async (id: string, status: Appointment['status'], notes?: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, notes: notes !== undefined ? notes : a.notes } : a))
    );
    try {
      await supabase.from('appointments').update({ status, ...(notes !== undefined ? { notes } : {}) }).eq('id', id);
    } catch (e) {
      console.warn('Sync notice for updateAppointmentStatus:', e);
    }
    return true;
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await supabase.from('leads').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync notice for deleteLead:', e);
    }
    return true;
  };

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    try {
      await supabase.from('appointments').delete().eq('id', id);
    } catch (e) {
      console.warn('Sync notice for deleteAppointment:', e);
    }
    return true;
  };

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
