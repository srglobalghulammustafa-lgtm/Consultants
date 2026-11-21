import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, DollarSign, Calendar, ArrowRight, X, CheckCircle } from 'lucide-react';
import { COURSE_CATEGORIES } from '../data/mockData';
import { Course } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { Reveal } from '../components/Reveal';
import { usePageTransition } from '../components/PageTransition';

export const Courses: React.FC = () => {
  const { courses } = useLiveData();
  const { navigateWithTransition } = usePageTransition();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCourse, setActiveModalCourse] = useState<Course | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = selectedCategory === 'all' || course.category_slug === selectedCategory;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.career_paths.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <Reveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full">Program Catalog</span>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 mt-3 font-serif">Courses & Career Pathways</h1>
            <p className="text-slate-600 mt-2 sm:mt-3 text-sm sm:text-base">
              Explore accredited Australian AQF trade qualifications, UK and Canadian university degrees, and technical vocational certificates.
            </p>
          </div>
        </Reveal>

        {/* Filter Controls */}
        <Reveal variant="fade-up" delay={80}>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 sm:mb-10 space-y-4 sm:space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course title, country, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Category Chips */}
          <div className="flex overflow-x-auto sm:flex-wrap gap-2 pt-1 pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({courses.length})
            </button>
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        </Reveal>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, idx) => (
            <Reveal key={course.id} variant="fade-up" delay={Math.min(idx * 75, 420)} className="h-full">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-300 transition-all duration-300 group h-full">
                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md border border-brand-200">
                      {course.country}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-navy-950 mb-3 group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Estimated Tuition:</span>
                      <span className="text-yellow-600 font-bold">{course.estimated_fees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Intake Months:</span>
                      <span className="text-slate-700 font-semibold">{course.intake_months}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Career Outcomes:</span>
                      <span className="text-slate-700 truncate max-w-[170px]">{course.career_paths}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => setActiveModalCourse(course)}
                    className="w-full bg-slate-900 group-hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Details & Inquire</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Reveal variant="zoom-in">
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-slate-700">No courses found matching your criteria</h4>
              <p className="text-sm text-slate-500 mt-1">Try modifying your search keywords or switching category filters.</p>
            </div>
          </Reveal>
        )}
      </div>

      {/* Course Detail Modal */}
      {activeModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-tab-reveal">
            <button
              onClick={() => setActiveModalCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
              aria-label="Close course modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded">
              {activeModalCourse.country} Program
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-navy-950 mt-3 mb-4 pr-8">
              {activeModalCourse.title}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-4 rounded-xl mb-6 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Course Duration</span>
                <span className="font-bold text-navy-950">{activeModalCourse.duration}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Estimated Tuition</span>
                <span className="font-bold text-yellow-600">{activeModalCourse.estimated_fees}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Intake Months</span>
                <span className="font-bold text-navy-950">{activeModalCourse.intake_months}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Accreditation</span>
                <span className="font-bold text-brand-600">CRICOS / AQF Compliant</span>
              </div>
            </div>

            <h4 className="font-bold text-base text-navy-950 mb-2">Program Overview</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {activeModalCourse.description}
            </p>

            <h4 className="font-bold text-base text-navy-950 mb-2">Career & Migration Prospects</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Graduates of this program can pursue roles such as: <strong>{activeModalCourse.career_paths}</strong>. For Australia, this qualification is aligned with skilled occupation lists and regional post-study work streams.
            </p>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-4">
              <Link
                to="/book-appointment"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModalCourse(null);
                  navigateWithTransition('/book-appointment', 'Book Consultation');
                }}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Counseling for this Course</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
