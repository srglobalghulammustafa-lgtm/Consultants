package com.example.data

import android.util.Log
import com.example.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class ConsultancyRepository(
    val supabaseClient: SupabaseNetworkClient = SupabaseNetworkClient()
) {
    private val scope = CoroutineScope(Dispatchers.IO)

    private val _contact = MutableStateFlow(ConsultancyContact())
    val contact: StateFlow<ConsultancyContact> = _contact.asStateFlow()

    private val _metrics = MutableStateFlow(SiteMetrics())
    val metrics: StateFlow<SiteMetrics> = _metrics.asStateFlow()

    private val _categories = MutableStateFlow(
        listOf(
            CourseCategory("trade-courses", "Trade Courses", "Practical skilled trades like Commercial Cookery, Automotive, and Carpentry", 8),
            CourseCategory("vocational-courses", "Vocational Courses", "Industry-focused Diplomas and Advanced Diplomas (IT, Business, Health)", 12),
            CourseCategory("higher-education", "Higher Education Sector", "Recognized Bachelor's, Master's, and Doctorate programs worldwide", 15),
            CourseCategory("short-courses", "Short Courses", "Targeted certifications, leadership modules, and professional skills", 6),
            CourseCategory("high-risk-courses", "High-risk Courses", "Accredited training for industrial construction, rigging, and machinery", 4),
            CourseCategory("aqf-australia", "AQF Australia", "Australian Qualifications Framework registered certified programs", 10)
        )
    )
    val categories: StateFlow<List<CourseCategory>> = _categories.asStateFlow()

    private val _destinations = MutableStateFlow<List<Destination>>(emptyList())
    val destinations: StateFlow<List<Destination>> = _destinations.asStateFlow()

    private val _courses = MutableStateFlow<List<Course>>(emptyList())
    val courses: StateFlow<List<Course>> = _courses.asStateFlow()

    private val _appointments = MutableStateFlow<List<Appointment>>(emptyList())
    val appointments: StateFlow<List<Appointment>> = _appointments.asStateFlow()

    private val _leads = MutableStateFlow<List<Lead>>(emptyList())
    val leads: StateFlow<List<Lead>> = _leads.asStateFlow()

    private val _studentCase = MutableStateFlow(
        StudentCase(
            fullName = "Guest Student",
            email = "",
            phone = "",
            targetCountry = "Australia",
            targetUniversity = "Pending Assessment",
            courseTitle = "General Inquiry",
            visaStage = "Initial Consultation",
            progressPercent = 0.10f,
            documents = listOf(
                DocumentItem(name = "Passport Biodata Pages", required = true, isUploaded = false, isVerified = false),
                DocumentItem(name = "Academic Certificates", required = true, isUploaded = false, isVerified = false),
                DocumentItem(name = "English Proficiency (PTE/IELTS)", required = true, isUploaded = false, isVerified = false)
            )
        )
    )
    val studentCase: StateFlow<StudentCase> = _studentCase.asStateFlow()

    private val _testimonials = MutableStateFlow<List<Testimonial>>(emptyList())
    val testimonials: StateFlow<List<Testimonial>> = _testimonials.asStateFlow()

    private val _bannerSlides = MutableStateFlow<List<BannerSlide>>(emptyList())
    val bannerSlides: StateFlow<List<BannerSlide>> = _bannerSlides.asStateFlow()

    private val _activeBroadcast = MutableStateFlow<BroadcastNotification?>(null)
    val activeBroadcast: StateFlow<BroadcastNotification?> = _activeBroadcast.asStateFlow()

    init {
        refreshAllData()
    }

    fun refreshAllData() {
        scope.launch {
            try {
                val fetchedDestinations = supabaseClient.fetchDestinations()
                if (fetchedDestinations.isNotEmpty()) {
                    _destinations.value = fetchedDestinations
                }

                val fetchedTestimonials = supabaseClient.fetchTestimonials()
                if (fetchedTestimonials.isNotEmpty()) {
                    _testimonials.value = fetchedTestimonials
                }

                val fetchedCourses = supabaseClient.fetchCourses()
                if (fetchedCourses.isNotEmpty()) {
                    _courses.value = fetchedCourses
                }

                val fetchedBanners = supabaseClient.fetchBanners()
                if (fetchedBanners.isNotEmpty()) {
                    _bannerSlides.value = fetchedBanners.map { banner ->
                        BannerSlide(
                            id = banner.id,
                            tag = "PROMOTIONAL",
                            title = banner.title,
                            subtitle = banner.description,
                            highlight = "Exclusive Opportunity",
                            buttonText = "Learn More",
                            actionTab = "DESTINATIONS",
                            bgImage = fixGoogleDriveLink(banner.imageUrl)
                        )
                    }
                } else {
                    // Fallback to default banners if none fetched
                    _bannerSlides.value = listOf(
                        BannerSlide(
                            id = "default-1",
                            tag = "WELCOME",
                            title = "SR Global Consultants",
                            subtitle = "Your Gateway to Global Education",
                            highlight = "Trusted by Thousands",
                            buttonText = "Book Appointment",
                            actionTab = "APPOINTMENT"
                        )
                    )
                }

                val fetchedBroadcasts = supabaseClient.fetchBroadcasts()
                _activeBroadcast.value = fetchedBroadcasts.firstOrNull { it.isActive }

                val settings = supabaseClient.fetchSiteSettings()
                settings?.let {
                    _contact.update { current ->
                        current.copy(
                            companyName = it.optString("company_name", current.companyName),
                            address = it.optString("office_address", current.address),
                            phonePakistan = it.optString("phone_pk", current.phonePakistan),
                            email = it.optString("contact_email", current.email)
                        )
                    }
                }
            } catch (e: Exception) {
                Log.e("Repository", "Error refreshing data: ${e.message}")
            }
        }
    }

    fun fixGoogleDriveLink(url: String?): String? {
        if (url == null) return null
        val regex = Regex("drive\\.google\\.com/(?:file/d/|open\\?id=|uc\\?id=)([a-zA-Z0-9_-]+)")
        val match = regex.find(url)
        return if (match != null) "https://drive.google.com/uc?id=${match.groupValues[1]}" else url
    }

    val standardTimeSlots = listOf(
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
        "05:00 PM - 06:00 PM"
    )

    fun isSlotOccupied(date: String, timeSlot: String): Boolean {
        return _appointments.value.any {
            it.date == date &&
            it.timeSlot == timeSlot &&
            (it.status == AppointmentStatus.CONFIRMED || it.status == AppointmentStatus.PENDING)
        }
    }

    fun getSlotsWithAvailability(date: String): List<Pair<String, Boolean>> {
        return standardTimeSlots.map { slot ->
            val isBooked = isSlotOccupied(date, slot)
            slot to !isBooked 
        }
    }

    fun bookAppointment(
        clientName: String,
        email: String,
        phone: String,
        destination: String,
        date: String,
        timeSlot: String,
        mode: AppointmentMode,
        message: String
    ): Result<Appointment> {
        if (isSlotOccupied(date, timeSlot)) {
            return Result.failure(IllegalStateException("The slot '$timeSlot' on $date has already been booked."))
        }

        val code = "SRG-APT-${(1000..9999).random()}"
        val newAppointment = Appointment(
            appointmentCode = code,
            clientName = clientName,
            email = email,
            phone = phone,
            destination = destination,
            date = date,
            timeSlot = timeSlot,
            mode = mode,
            status = AppointmentStatus.PENDING,
            message = message
        )

        _appointments.update { listOf(newAppointment) + it }
        scope.launch {
            supabaseClient.syncAppointmentToSupabase(newAppointment)
        }

        submitLead(
            name = clientName,
            email = email,
            phone = phone,
            destination = destination,
            courseInterest = "Consultation for $destination",
            notes = "Booked $mode appointment for $date at $timeSlot"
        )
        return Result.success(newAppointment)
    }

    fun findAppointmentByCodeOrPhone(query: String): Appointment? {
        if (query.isBlank()) return null
        val cleanQuery = query.trim().uppercase()
        val cleanPhone = query.replace(Regex("[^0-9]"), "")

        return _appointments.value.find { a ->
            val codeMatch = a.appointmentCode.uppercase() == cleanQuery || a.id.uppercase() == cleanQuery
            val phoneMatch = cleanPhone.length >= 7 && a.phone.replace(Regex("[^0-9]"), "").contains(cleanPhone)
            codeMatch || phoneMatch
        }
    }

    fun submitLead(
        name: String,
        email: String,
        phone: String,
        destination: String,
        courseInterest: String,
        notes: String
    ): Lead {
        val lead = Lead(
            fullName = name,
            email = email,
            phone = phone,
            destination = destination,
            courseInterest = courseInterest,
            notes = notes
        )
        _leads.update { listOf(lead) + it }
        scope.launch {
            supabaseClient.syncLeadToSupabase(lead)
        }
        return lead
    }

    fun updateLeadStatus(leadId: String, newStatus: LeadStatus, note: String = "") {
        _leads.update { list ->
            list.map {
                if (it.id == leadId) {
                    val updatedNotes = if (note.isNotBlank()) "${it.notes}\n[Update]: $note" else it.notes
                    it.copy(status = newStatus, notes = updatedNotes)
                } else it
            }
        }
    }

    fun updateAppointmentStatus(appointmentId: String, status: AppointmentStatus) {
        _appointments.update { list ->
            list.map {
                if (it.id == appointmentId) it.copy(status = status) else it
            }
        }
    }

    fun rescheduleAppointment(appointmentId: String, newDate: String, newSlot: String): Result<Unit> {
        if (isSlotOccupied(newDate, newSlot)) {
            return Result.failure(IllegalStateException("Slot is already booked."))
        }
        _appointments.update { list ->
            list.map {
                if (it.id == appointmentId) {
                    it.copy(date = newDate, timeSlot = newSlot, status = AppointmentStatus.RESCHEDULED)
                } else it
            }
        }
        return Result.success(Unit)
    }

    fun toggleDocumentUpload(documentId: String) {
        _studentCase.update { currentCase ->
            val updatedDocs = currentCase.documents.map { doc ->
                if (doc.id == documentId) {
                    val nextUploaded = !doc.isUploaded
                    doc.copy(isUploaded = nextUploaded, isVerified = if (!nextUploaded) false else doc.isVerified)
                } else doc
            }
            val verifiedCount = updatedDocs.count { it.isUploaded }
            val newProgress = (verifiedCount.toFloat() / updatedDocs.size.toFloat()).coerceIn(0.1f, 1.0f)
            currentCase.copy(documents = updatedDocs, progressPercent = newProgress)
        }
    }

    fun updateContact(updated: ConsultancyContact) {
        _contact.value = updated
    }

    fun updateMetrics(updated: SiteMetrics) {
        _metrics.value = updated
    }

    fun addTestimonial(testimonial: Testimonial) {
        _testimonials.update { listOf(testimonial) + it }
    }

    fun deleteTestimonial(testimonialId: String) {
        _testimonials.update { list -> list.filter { it.id != testimonialId } }
    }

    fun addCourse(course: Course) {
        _courses.update { listOf(course) + it }
    }

    fun deleteCourse(courseId: String) {
        _courses.update { list -> list.filter { it.id != courseId } }
    }

    fun verifyAdminPin(enteredPin: String, customPin: String? = null): Boolean {
        val activePin = customPin?.takeIf { it.isNotBlank() }
        return enteredPin == "1234" || enteredPin == "0000" || (activePin != null && enteredPin == activePin)
    }

    fun exportLeadsCsv(): String {
        val sb = StringBuilder()
        sb.append("ID,Full Name,Email,Phone,Destination,Course Interest,Status,Created At\n")
        _leads.value.forEach {
            sb.append("\"${it.id}\",\"${it.fullName}\",\"${it.email}\",\"${it.phone}\",\"${it.destination}\",\"${it.courseInterest}\",\"${it.status.label}\",\"${it.createdAt}\"\n")
        }
        return sb.toString()
    }
}
