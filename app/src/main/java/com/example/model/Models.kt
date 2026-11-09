package com.example.model

import java.util.UUID

enum class LeadStatus(val label: String) {
    NEW("New"),
    CONTACTED("Contacted"),
    IN_PROGRESS("In Progress"),
    CONVERTED("Converted"),
    CLOSED("Closed")
}

enum class AppointmentMode(val label: String) {
    OFFICE("Office (Gujranwala)"),
    ONLINE("Online (Google Meet/WhatsApp)")
}

enum class AppointmentStatus(val label: String) {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    RESCHEDULED("Rescheduled"),
    CANCELLED("Cancelled"),
    COMPLETED("Completed")
}

data class Lead(
    val id: String = UUID.randomUUID().toString(),
    val fullName: String,
    val email: String,
    val phone: String,
    val destination: String,
    val courseInterest: String,
    val status: LeadStatus = LeadStatus.NEW,
    val source: String = "Mobile App",
    val notes: String = "",
    val followUpDate: String = "",
    val createdAt: String = "Today"
)

data class Appointment(
    val id: String = UUID.randomUUID().toString(),
    val appointmentCode: String = "SRG-APT-${(1000..9999).random()}",
    val clientName: String,
    val email: String,
    val phone: String,
    val destination: String,
    val date: String, // YYYY-MM-DD
    val timeSlot: String, // e.g. "10:00 AM - 11:00 AM"
    val mode: AppointmentMode = AppointmentMode.OFFICE,
    val status: AppointmentStatus = AppointmentStatus.PENDING,
    val message: String = "",
    val notes: String = "",
    val createdAt: String = "Today"
)

data class CourseCategory(
    val slug: String,
    val name: String,
    val description: String,
    val courseCount: Int = 0
)

data class Course(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val categorySlug: String,
    val country: String,
    val duration: String,
    val estimatedFees: String,
    val intakeMonths: String,
    val description: String,
    val careerPaths: String
)

data class Destination(
    val id: String? = null,
    val countryName: String,
    val slug: String,
    val capital: String,
    val currency: String,
    val avgLivingCost: String,
    val workRights: String,
    val visaSubclass: String,
    val overview: String,
    val visaProcess: String,
    val admissionRequirements: String,
    val topUniversities: List<String>,
    val flagEmoji: String,
    val imageUrl: String? = null
)

data class Testimonial(
    val id: String = UUID.randomUUID().toString(),
    val studentName: String,
    val university: String,
    val country: String,
    val quote: String,
    val rating: Int = 5,
    val year: String = "2025",
    val imageUrl: String? = null
)

data class BroadcastNotification(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val message: String,
    val priority: String = "Normal",
    val link: String? = null,
    val playSound: Boolean = false,
    val isActive: Boolean = true,
    val createdAt: String = ""
)

data class Banner(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val description: String,
    val imageUrl: String,
    val link: String? = null
)

data class DocumentItem(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val required: Boolean = true,
    val isUploaded: Boolean = false,
    val isVerified: Boolean = false,
    val remarks: String = ""
)

data class StudentCase(
    val id: String = UUID.randomUUID().toString(),
    val fullName: String,
    val email: String,
    val phone: String,
    val targetCountry: String,
    val targetUniversity: String,
    val courseTitle: String,
    val visaStage: String,
    val progressPercent: Float,
    val documents: List<DocumentItem>
)

data class SiteMetrics(
    val studentsGuided: Int = 5200,
    val partnerUniversities: Int = 160,
    val visaSuccessRate: String = "98.4%",
    val yearsExperience: String = "12+"
)

data class ConsultancyContact(
    val companyName: String = "SR Global Consultants",
    val tagline: String = "Your Gateway to Global Education & Migration Success",
    val address: String = "1st Floor, 239A Civic Center, Gujranwala, Pakistan",
    val latitude: Double = 32.1841449,
    val longitude: Double = 74.1809924,
    val phonePakistan: String = "+92 327 8321560",
    val phoneAustralia: String = "+61 415 331872",
    val email: String = "contact@srglobalconsultants.com",
    val whatsappNumber: String = "923278321560",
    val facebook: String = "https://facebook.com/srglobalconsultants",
    val twitter: String = "https://twitter.com/srglobalconsult",
    val linkedin: String = "https://linkedin.com/in/srglobalconsult",
    val officeHours: String = "Mon - Sat: 10:00 AM - 6:00 PM (PKT)"
)

data class BannerSlide(
    val id: String = java.util.UUID.randomUUID().toString(),
    val tag: String,
    val title: String,
    val subtitle: String,
    val highlight: String,
    val buttonText: String,
    val actionTab: String = "APPOINTMENT",
    val gradientStart: Long = 0xFF0A192F,
    val gradientEnd: Long = 0xFF1B75BC,
    val bgImage: String? = null
)

