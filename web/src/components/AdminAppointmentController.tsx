import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
  MessageCircle,
  Plus,
  Lock,
  Unlock,
  Save,
  Search,
  X,
  Users,
} from 'lucide-react';
import { Appointment, TargetCountryOption } from '../types';
import { TIME_SLOTS } from '../data/mockData';
import { DEFAULT_TARGET_COUNTRIES } from '../context/SettingsContext';

interface AdminAppointmentControllerProps {
  appointments: Appointment[];
  maxPerDay: number;
  blockedDates: string[];
  blockedSlots: Record<string, string[]>;
  targetCountries?: TargetCountryOption[];
  isSyncing: boolean;
  onSaveConfig: (next: {
    maxPerDay: number;
    blockedDates: string[];
    blockedSlots: Record<string, string[]>;
  }) => Promise<void>;
  onUpdateStatus: (id: string, status: Appointment['status'], notes?: string) => Promise<boolean>;
  onReschedule: (
    id: string,
    appointment_date: string,
    time_slot: string,
    mode?: Appointment['mode'],
    notes?: string
  ) => Promise<boolean>;
  onAddAppointment: (appt: Omit<Appointment, 'id'>) => Promise<Appointment>;
  onDeleteAppointment: (id: string) => Promise<boolean>;
  onInspect: (appt: Appointment) => void;
  onNotify: (msg: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const AdminAppointmentController: React.FC<AdminAppointmentControllerProps> = ({
  appointments,
  maxPerDay,
  blockedDates,
  blockedSlots,
  targetCountries,
  isSyncing,
  onSaveConfig,
  onUpdateStatus,
  onReschedule,
  onAddAppointment,
  onDeleteAppointment,
  onInspect,
  onNotify,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];

  const activeCountries = useMemo(() => {
    const raw = targetCountries && targetCountries.length > 0 ? targetCountries : DEFAULT_TARGET_COUNTRIES;
    const filtered = raw.filter((c) => c.isActive !== false && c.name.trim() !== '');
    return filtered.length > 0 ? filtered : DEFAULT_TARGET_COUNTRIES;
  }, [targetCountries]);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [filterBySelectedDate, setFilterBySelectedDate] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dailyLimitInput, setDailyLimitInput] = useState<number>(maxPerDay || 10);

  // Manual Booking Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    client_name: '',
    phone: '',
    email: '',
    destination: 'Australia',
    appointment_date: todayIso,
    time_slot: TIME_SLOTS[0],
    mode: 'Office' as Appointment['mode'],
    status: 'Confirmed' as Appointment['status'],
    message: '',
  });

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleMode, setRescheduleMode] = useState<Appointment['mode']>('Office');
  const [rescheduleNote, setRescheduleNote] = useState('');

  // Group appointments by YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((a) => {
      const key = (a.appointment_date || '').slice(0, 10);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [appointments]);

  // Build calendar cells for current month (Mon-Sun grid)
  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewDate.year, viewDate.month, 1);
    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    // JS getDay(): 0 Sun, 1 Mon ... 6 Sat -> convert to Mon=0..Sun=6
    const startOffset = (firstOfMonth.getDay() + 6) % 7;

    const cells: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, iso: toIsoDate(viewDate.year, viewDate.month, d) });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, iso: null });
    }
    return cells;
  }, [viewDate]);

  const monthLabel = new Date(viewDate.year, viewDate.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  // Selected date stats & slots
  const selectedDayAppointments = appointmentsByDate[selectedDate] || [];
  const activeDayBookings = selectedDayAppointments.filter((a) => a.status !== 'Cancelled');
  const isSelectedDayBlocked = blockedDates.includes(selectedDate);
  const selectedDayBlockedSlots = blockedSlots[selectedDate] || [];

  // Summary counters
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'Pending').length,
      confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
      rescheduled: appointments.filter((a) => a.status === 'Rescheduled').length,
      completed: appointments.filter((a) => a.status === 'Completed').length,
      cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
    };
  }, [appointments]);

  // Unified Table Rows
  const visibleAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (filterBySelectedDate && (a.appointment_date || '').slice(0, 10) !== selectedDate) {
        return false;
      }
      if (statusFilter !== 'all' && a.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          a.client_name.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.destination.toLowerCase().includes(q) ||
          (a.appointment_code || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [appointments, filterBySelectedDate, selectedDate, statusFilter, searchQuery]);

  const toggleBlockDate = async (dateIso: string) => {
    const exists = blockedDates.includes(dateIso);
    const nextBlockedDates = exists
      ? blockedDates.filter((d) => d !== dateIso)
      : [...blockedDates, dateIso];
    await onSaveConfig({
      maxPerDay: dailyLimitInput,
      blockedDates: nextBlockedDates,
      blockedSlots,
    });
    onNotify(exists ? `Date ${dateIso} reopened for bookings.` : `Date ${dateIso} blocked from public bookings.`);
  };

  const toggleBlockSlot = async (dateIso: string, slot: string) => {
    const current = blockedSlots[dateIso] || [];
    const exists = current.includes(slot);
    const nextForDate = exists ? current.filter((s) => s !== slot) : [...current, slot];
    const nextMap = { ...blockedSlots, [dateIso]: nextForDate };
    if (nextForDate.length === 0) {
      delete nextMap[dateIso];
    }
    await onSaveConfig({
      maxPerDay: dailyLimitInput,
      blockedDates,
      blockedSlots: nextMap,
    });
    onNotify(exists ? `Slot ${slot} unlocked on ${dateIso}.` : `Slot ${slot} blocked on ${dateIso}.`);
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyLimitInput < 1) {
      onNotify('Daily quota must be at least 1.');
      return;
    }
    await onSaveConfig({
      maxPerDay: dailyLimitInput,
      blockedDates,
      blockedSlots,
    });
    onNotify(`Daily appointment quota updated to ${dailyLimitInput} bookings/day!`);
  };

  const openManualBookForSlot = (dateIso: string, slot?: string) => {
    setManualForm({
      client_name: '',
      phone: '',
      email: '',
      destination: 'Australia',
      appointment_date: dateIso,
      time_slot: slot || TIME_SLOTS[0],
      mode: 'Office',
      status: 'Confirmed',
      message: '',
    });
    setShowManualModal(true);
  };

  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleTarget(appt);
    setRescheduleDate((appt.appointment_date || todayIso).slice(0, 10));
    setRescheduleSlot(appt.time_slot || TIME_SLOTS[0]);
    setRescheduleMode(appt.mode || 'Office');
    setRescheduleNote(appt.notes || '');
  };

  return (
    <div className="space-y-6">
      {/* 1. Unified Command Header & Daily Quota Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-navy-950">Appointment Calendar & Controller</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspect filled dates visually on the calendar, block or open time slots, reschedule clients, and manage all bookings in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <form
            onSubmit={handleSaveQuota}
            className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200 flex-1 sm:flex-initial justify-between sm:justify-start"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Max / Day:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={dailyLimitInput}
                onChange={(e) => setDailyLimitInput(Number(e.target.value))}
                className="w-14 px-2 py-1 rounded-xl border border-slate-300 font-bold text-xs text-center bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSyncing}
              className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => openManualBookForSlot(selectedDate)}
            className="inline-flex items-center justify-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Manual Booking</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Status Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'All Bookings', val: stats.total, key: 'all', cls: 'bg-white border-slate-200 text-navy-950' },
          { label: 'Pending Fee', val: stats.pending, key: 'Pending', cls: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'Confirmed', val: stats.confirmed, key: 'Confirmed', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
          { label: 'Rescheduled', val: stats.rescheduled, key: 'Rescheduled', cls: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
          { label: 'Completed', val: stats.completed, key: 'Completed', cls: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Cancelled', val: stats.cancelled, key: 'Cancelled', cls: 'bg-rose-50 border-rose-200 text-rose-800' },
        ].map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setStatusFilter(pill.key)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${pill.cls} ${
              statusFilter === pill.key ? 'ring-2 ring-brand-500 shadow-sm' : 'hover:opacity-90'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{pill.label}</div>
            <div className="text-2xl font-black mt-0.5">{pill.val}</div>
          </button>
        ))}
      </div>

      {/* 3. Interactive Calendar + Date Slot Inspector Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar Grid */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-950">{monthLabel}</h3>
              <p className="text-[11px] text-slate-500">Tap any date to see filled slots & control availability</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  setViewDate({ year: d.getFullYear(), month: d.getMonth() });
                  setSelectedDate(todayIso);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewDate((prev) =>
                    prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }
                  )
                }
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewDate((prev) =>
                    prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }
                  )
                }
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarCells.map((cell, idx) => {
              if (!cell.day || !cell.iso) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-xl sm:rounded-2xl bg-slate-50/50" />;
              }

              const dayAppts = (appointmentsByDate[cell.iso] || []).filter((a) => a.status !== 'Cancelled');
              const confirmedCount = dayAppts.filter((a) => a.status === 'Confirmed').length;
              const pendingCount = dayAppts.filter((a) => a.status === 'Pending' || a.status === 'Rescheduled').length;
              const isFull = dayAppts.length >= maxPerDay;
              const isBlocked = blockedDates.includes(cell.iso);
              const isSelected = selectedDate === cell.iso;
              const isToday = cell.iso === todayIso;
              const slotBlockCount = (blockedSlots[cell.iso] || []).length;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelectedDate(cell.iso!)}
                  className={`h-14 sm:h-20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/30 shadow-sm'
                      : isBlocked
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : dayAppts.length > 0
                      ? 'bg-white border-brand-200 hover:border-brand-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-black ${
                        isToday
                          ? 'bg-navy-950 text-white px-1 sm:px-1.5 py-0.5 rounded-md'
                          : isSelected
                          ? 'text-brand-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {isBlocked ? (
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 shrink-0" />
                    ) : isFull ? (
                      <span className="hidden sm:inline text-[9px] font-black uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                        Full
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    {dayAppts.length > 0 ? (
                      <div className="flex items-center justify-between gap-0.5 sm:gap-1">
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md ${
                            isFull ? 'bg-rose-100 text-rose-700' : 'bg-brand-100 text-brand-800'
                          }`}
                        >
                          {dayAppts.length}<span className="hidden sm:inline">/{maxPerDay}</span>
                        </span>
                        <div className="flex items-center gap-0.5">
                          {confirmedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Confirmed" />}
                          {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Pending/Rescheduled" />}
                        </div>
                      </div>
                    ) : slotBlockCount > 0 ? (
                      <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded inline-block">
                        {slotBlockCount}<span className="hidden sm:inline"> locked</span>
                      </span>
                    ) : (
                      <span className="hidden sm:inline text-[9px] text-slate-400">Open</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Confirmed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pending / Rescheduled
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Full / Blocked Date
            </span>
          </div>
        </div>

        {/* Right: Selected Date Slot Matrix & Day Controls */}
        <div className="xl:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                  Selected Date Schedule
                </div>
                <h3 className="text-lg font-black text-navy-950 mt-0.5">{selectedDate}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeDayBookings.length} / {maxPerDay} active slots filled •{' '}
                  {Math.max(0, maxPerDay - activeDayBookings.length)} remaining
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBlockDate(selectedDate)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelectedDayBlocked
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {isSelectedDayBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isSelectedDayBlocked ? 'Unblock Day' : 'Block Whole Day'}</span>
                </button>
              </div>
            </div>

            {isSelectedDayBlocked && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>This date is locked. Public users cannot book new appointments on {selectedDate}.</span>
              </div>
            )}

            {/* Slot-by-slot inspector */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {TIME_SLOTS.map((slot) => {
                const slotBooking = activeDayBookings.find((a) => a.time_slot === slot);
                const isSlotBlocked = selectedDayBlockedSlots.includes(slot);

                return (
                  <div
                    key={slot}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                      slotBooking
                        ? 'bg-brand-50/70 border-brand-200'
                        : isSlotBlocked
                        ? 'bg-slate-100 border-slate-300 opacity-85'
                        : 'bg-slate-50 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="text-xs font-bold text-navy-950">{slot}</span>
                        {slotBooking ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              slotBooking.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : slotBooking.status === 'Rescheduled'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {slotBooking.status}
                          </span>
                        ) : isSlotBlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Blocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Open
                          </span>
                        )}
                      </div>

                      {slotBooking && (
                        <div className="text-[11px] text-slate-600 mt-1 truncate">
                          <strong>{slotBooking.client_name}</strong> ({slotBooking.appointment_code || slotBooking.mode}) •{' '}
                          {slotBooking.destination}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {slotBooking ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onInspect(slotBooking)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 text-[11px] font-bold"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => openRescheduleModal(slotBooking)}
                            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600"
                            title="Reschedule Slot"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openManualBookForSlot(selectedDate, slot)}
                            className="px-2.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold"
                          >
                            + Book
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBlockSlot(selectedDate, slot)}
                            className={`p-1.5 rounded-xl border text-xs transition-colors ${
                              isSlotBlocked
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600'
                            }`}
                            title={isSlotBlocked ? 'Unlock Slot' : 'Block Slot'}
                          >
                            {isSlotBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterBySelectedDate((v) => !v)}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
              filterBySelectedDate
                ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {filterBySelectedDate
                ? `Table Filtered to ${selectedDate} (Click to Show All Dates)`
                : `Filter Unified Table to ${selectedDate}`}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Unified Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-navy-950">
              {filterBySelectedDate ? `Appointments on ${selectedDate}` : 'All Appointments Unified Table'}
            </h3>
            <p className="text-xs text-slate-500">
              Showing {visibleAppointments.length} of {appointments.length} total reservations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref code, name, phone..."
                className="w-full md:w-56 pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Fee</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {filterBySelectedDate && (
              <button
                type="button"
                onClick={() => setFilterBySelectedDate(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Show All Dates
              </button>
            )}
          </div>
        </div>

        {/* Mobile Touch Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {visibleAppointments.length === 0 ? (
            <div className="py-10 px-4 text-center text-slate-400 text-xs">
              No appointments match the current filter.
            </div>
          ) : (
            visibleAppointments.map((appt) => (
              <div key={appt.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-[11px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block">
                      {appt.appointment_code || `SRG-APT-${appt.id.slice(0, 4)}`}
                    </span>
                    <div className="font-bold text-navy-950 text-base mt-1">{appt.client_name}</div>
                    <div className="text-xs text-slate-500 truncate">{appt.phone} • {appt.email}</div>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      appt.mode === 'Office' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {appt.mode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs border border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Date & Slot</div>
                    <div className="font-bold text-slate-800 mt-0.5">{appt.appointment_date}</div>
                    <div className="text-slate-600">{appt.time_slot}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Destination</div>
                    <div className="font-bold text-navy-950 mt-0.5">{appt.destination}</div>
                    {appt.notes && <div className="text-[11px] text-slate-500 truncate">{appt.notes}</div>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <select
                    value={appt.status}
                    onChange={(e) => {
                      onUpdateStatus(appt.id, e.target.value as Appointment['status']);
                      onNotify(`Appointment ${appt.appointment_code || ''} updated to ${e.target.value}`);
                    }}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none ${
                      appt.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : appt.status === 'Completed'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : appt.status === 'Rescheduled'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : appt.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <option value="Pending">Pending Fee</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    {appt.status !== 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(appt.id, 'Confirmed');
                          onNotify(`Confirmed ${appt.client_name}'s appointment!`);
                        }}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        title="Quick Confirm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openRescheduleModal(appt)}
                      className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      title="Reschedule"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onInspect(appt)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <a
                      href={`https://wa.me/${appt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${appt.client_name}! Regarding your SR Global Appointment (${appt.appointment_code || 'SRG-APT'}) on ${appt.appointment_date} (${appt.time_slot}) — current status: ${appt.status}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete appointment for ${appt.client_name}?`)) {
                          onDeleteAppointment(appt.id);
                          onNotify('Appointment deleted');
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ref Code</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Mode / Country</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No appointments match the current filter.
                  </td>
                </tr>
              ) : (
                visibleAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-brand-600 whitespace-nowrap">
                      {appt.appointment_code || `SRG-APT-${appt.id.slice(0, 4)}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-950">{appt.client_name}</div>
                      {appt.notes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{appt.notes}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div>{appt.phone}</div>
                      <div className="text-slate-400">{appt.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <div className="font-bold text-slate-800">{appt.appointment_date}</div>
                      <div className="text-slate-500">{appt.time_slot}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span
                        className={`inline-block font-bold px-2 py-0.5 rounded-full mb-1 ${
                          appt.mode === 'Office' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {appt.mode}
                      </span>
                      <div className="text-slate-600 font-medium">{appt.destination}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={appt.status}
                        onChange={(e) => {
                          onUpdateStatus(appt.id, e.target.value as Appointment['status']);
                          onNotify(`Appointment ${appt.appointment_code || ''} updated to ${e.target.value}`);
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                          appt.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : appt.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : appt.status === 'Rescheduled'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : appt.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pending">Pending Fee</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status !== 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateStatus(appt.id, 'Confirmed');
                              onNotify(`Confirmed ${appt.client_name}'s appointment!`);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            title="Quick Confirm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(appt)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          title="Reschedule Date & Slot"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onInspect(appt)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                          title="Inspect Details & Notes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <a
                          href={`https://wa.me/${appt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${appt.client_name}! Regarding your SR Global Appointment (${appt.appointment_code || 'SRG-APT'}) on ${appt.appointment_date} (${appt.time_slot}) — current status: ${appt.status}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete appointment for ${appt.client_name}?`)) {
                              onDeleteAppointment(appt.id);
                              onNotify('Appointment deleted');
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: MANUAL BOOKING BY ADMIN */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-navy-950">Create Manual Appointment</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onAddAppointment(manualForm);
                setShowManualModal(false);
                onNotify(`Manual appointment booked for ${manualForm.client_name} on ${manualForm.appointment_date}!`);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.client_name}
                    onChange={(e) => setManualForm({ ...manualForm, client_name: e.target.value })}
                    placeholder="e.g. Ali Raza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination</label>
                  <select
                    value={manualForm.destination}
                    onChange={(e) => setManualForm({ ...manualForm, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {activeCountries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.appointment_date}
                    onChange={(e) => setManualForm({ ...manualForm, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot *</label>
                  <select
                    value={manualForm.time_slot}
                    onChange={(e) => setManualForm({ ...manualForm, time_slot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mode</label>
                  <select
                    value={manualForm.mode}
                    onChange={(e) => setManualForm({ ...manualForm, mode: e.target.value as Appointment['mode'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Office">Office</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as Appointment['status'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending Fee</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Case Notes</label>
                <textarea
                  rows={2}
                  value={manualForm.message}
                  onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                  placeholder="Walk-in client details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
                >
                  Save & Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE APPOINTMENT */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-navy-950">Reschedule Appointment</h3>
                <p className="text-xs text-slate-500">
                  {rescheduleTarget.client_name} ({rescheduleTarget.appointment_code || rescheduleTarget.id.slice(0, 6)})
                </p>
              </div>
              <button onClick={() => setRescheduleTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onReschedule(
                  rescheduleTarget.id,
                  rescheduleDate,
                  rescheduleSlot,
                  rescheduleMode,
                  rescheduleNote
                );
                onNotify(`Rescheduled ${rescheduleTarget.client_name} to ${rescheduleDate} (${rescheduleSlot})!`);
                setRescheduleTarget(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Appointment Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {TIME_SLOTS.map((s) => {
                    const taken = (appointmentsByDate[rescheduleDate] || []).some(
                      (a) => a.time_slot === s && a.status !== 'Cancelled' && a.id !== rescheduleTarget.id
                    );
                    return (
                      <option key={s} value={s} disabled={taken}>
                        {s} {taken ? '(Already Booked)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Consultation Mode</label>
                <select
                  value={rescheduleMode}
                  onChange={(e) => setRescheduleMode(e.target.value as Appointment['mode'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Office">Office</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reschedule Note</label>
                <textarea
                  rows={2}
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Reason or instructions for student..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 hidden" />
                  <Save className="w-3.5 h-3.5" />
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
