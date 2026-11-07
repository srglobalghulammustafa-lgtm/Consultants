package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ConsultancyRepository
import com.example.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MainViewModel(
    val repository: ConsultancyRepository = ConsultancyRepository()
) : ViewModel() {

    val contact = repository.contact
    val metrics = repository.metrics
    val destinations = repository.destinations
    val categories = repository.categories
    val courses = repository.courses
    val appointments = repository.appointments
    val leads = repository.leads
    val studentCase = repository.studentCase
    val testimonials = repository.testimonials
    val bannerSlides = repository.bannerSlides

    // Notification message alert state
    private val _notificationSuccessMessage = MutableStateFlow<String?>(null)
    val notificationSuccessMessage: StateFlow<String?> = _notificationSuccessMessage.asStateFlow()

    // UI Navigation State
    private val _currentTab = MutableStateFlow(NavTab.HOME)
    val currentTab: StateFlow<NavTab> = _currentTab.asStateFlow()

    private val _isAdminMode = MutableStateFlow(false)
    val isAdminMode: StateFlow<Boolean> = _isAdminMode.asStateFlow()

    private val _selectedDestination = MutableStateFlow<Destination?>(null)
    val selectedDestination: StateFlow<Destination?> = _selectedDestination.asStateFlow()

    private val _selectedCourse = MutableStateFlow<Course?>(null)
    val selectedCourse: StateFlow<Course?> = _selectedCourse.asStateFlow()

    // Course Filtering
    private val _selectedCategorySlug = MutableStateFlow<String?>("all")
    val selectedCategorySlug: StateFlow<String?> = _selectedCategorySlug.asStateFlow()

    private val _courseSearchQuery = MutableStateFlow("")
    val courseSearchQuery: StateFlow<String> = _courseSearchQuery.asStateFlow()

    val filteredCourses: StateFlow<List<Course>> = combine(
        courses,
        selectedCategorySlug,
        courseSearchQuery
    ) { allCourses, category, query ->
        allCourses.filter { course ->
            val matchesCategory = category == "all" || category == null || course.categorySlug == category
            val matchesQuery = query.isBlank() ||
                    course.title.contains(query, ignoreCase = true) ||
                    course.country.contains(query, ignoreCase = true) ||
                    course.description.contains(query, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Appointment Booking State
    private val _selectedDate = MutableStateFlow(getCurrentDateString())
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    private val _selectedSlot = MutableStateFlow<String?>(null)
    val selectedSlot: StateFlow<String?> = _selectedSlot.asStateFlow()

    val availableSlotsForSelectedDate: StateFlow<List<Pair<String, Boolean>>> = _selectedDate.map { date ->
        repository.getSlotsWithAvailability(date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _bookingSuccessMessage = MutableStateFlow<String?>(null)
    val bookingSuccessMessage: StateFlow<String?> = _bookingSuccessMessage.asStateFlow()

    private val _bookingErrorMessage = MutableStateFlow<String?>(null)
    val bookingErrorMessage: StateFlow<String?> = _bookingErrorMessage.asStateFlow()

    // Quick Inquiry State
    private val _inquirySuccessMessage = MutableStateFlow<String?>(null)
    val inquirySuccessMessage: StateFlow<String?> = _inquirySuccessMessage.asStateFlow()

    fun setTab(tab: NavTab) {
        _currentTab.value = tab
    }

    fun toggleAdminMode(enabled: Boolean) {
        _isAdminMode.value = enabled
    }

    fun selectDestination(destination: Destination?) {
        _selectedDestination.value = destination
    }

    fun selectCourse(course: Course?) {
        _selectedCourse.value = course
    }

    fun selectCategoryFilter(slug: String?) {
        _selectedCategorySlug.value = slug
    }

    fun setCourseSearchQuery(query: String) {
        _courseSearchQuery.value = query
    }

    fun selectAppointmentDate(date: String) {
        _selectedDate.value = date
        _selectedSlot.value = null // reset slot choice when date changes
    }

    fun selectAppointmentSlot(slot: String) {
        _selectedSlot.value = slot
    }

    fun bookAppointment(
        clientName: String,
        email: String,
        phone: String,
        destination: String,
        mode: AppointmentMode,
        message: String
    ) {
        val date = _selectedDate.value
        val slot = _selectedSlot.value
        if (slot == null) {
            _bookingErrorMessage.value = "Please select a time slot."
            return
        }

        viewModelScope.launch {
            val result = repository.bookAppointment(
                clientName = clientName,
                email = email,
                phone = phone,
                destination = destination,
                date = date,
                timeSlot = slot,
                mode = mode,
                message = message
            )
            result.onSuccess {
                _bookingSuccessMessage.value = "Appointment confirmed for $date ($slot). A counselor has been assigned."
                _bookingErrorMessage.value = null
                _selectedSlot.value = null
            }.onFailure { error ->
                _bookingErrorMessage.value = error.message ?: "Booking failed. Slot may have been taken."
                _bookingSuccessMessage.value = null
            }
        }
    }

    fun clearBookingAlerts() {
        _bookingSuccessMessage.value = null
        _bookingErrorMessage.value = null
    }

    fun submitQuickInquiry(
        fullName: String,
        email: String,
        phone: String,
        destination: String,
        courseInterest: String,
        notes: String
    ) {
        viewModelScope.launch {
            repository.submitLead(
                name = fullName,
                email = email,
                phone = phone,
                destination = destination,
                courseInterest = courseInterest,
                notes = notes
            )
            _inquirySuccessMessage.value = "Thank you! Your inquiry has been submitted. Our Gujranwala office will contact you shortly."
        }
    }

    fun clearInquiryMessage() {
        _inquirySuccessMessage.value = null
    }

    fun updateLeadStatus(leadId: String, newStatus: LeadStatus, note: String = "") {
        repository.updateLeadStatus(leadId, newStatus, note)
    }

    fun updateAppointmentStatus(appointmentId: String, status: AppointmentStatus) {
        repository.updateAppointmentStatus(appointmentId, status)
    }

    fun updateContact(updated: ConsultancyContact) {
        repository.updateContact(updated)
    }

    fun updateMetrics(updated: SiteMetrics) {
        repository.updateMetrics(updated)
    }

    fun addTestimonial(testimonial: Testimonial) {
        repository.addTestimonial(testimonial)
    }

    fun deleteTestimonial(id: String) {
        repository.deleteTestimonial(id)
    }

    fun addCourse(course: Course) {
        repository.addCourse(course)
    }

    fun deleteCourse(id: String) {
        repository.deleteCourse(id)
    }

    fun sendBroadcastNotification(context: android.content.Context, title: String, message: String) {
        com.example.util.NotificationHelper.showNotification(context, title, message)
        _notificationSuccessMessage.value = "Notification dispatched to device status bar!"
    }

    fun toggleDocumentUpload(docId: String) {
        repository.toggleDocumentUpload(docId)
    }

    fun clearNotificationMessage() {
        _notificationSuccessMessage.value = null
    }

    private fun getCurrentDateString(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }
}

enum class NavTab(val title: String) {
    HOME("Home"),
    DESTINATIONS("Destinations"),
    COURSES("Courses"),
    APPOINTMENT("Book"),
    STUDENT_PORTAL("Tracker"),
    CONTACT("Contact")
}
