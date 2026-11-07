package com.example.data

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

    private val _destinations = MutableStateFlow(
        listOf(
            Destination(
                countryName = "Australia",
                slug = "australia",
                capital = "Canberra",
                currency = "AUD ($)",
                avgLivingCost = "AUD 21,000 - 24,500 / year",
                workRights = "48 hours per fortnight during study; unlimited in breaks",
                visaSubclass = "Subclass 500 Student Visa",
                overview = "Australia offers high-ranking Go8 universities, exceptional quality of life, and generous post-study work rights (Subclass 485). A top destination for students seeking trade, vocational, and university qualifications.",
                visaProcess = "1. Program consultation & University/College offer letter.\n2. Genuine Student (GS) statement preparation.\n3. Pay tuition deposit & receive Confirmation of Enrolment (CoE).\n4. Undergo panel physician medical examination & biometrics.\n5. Lodge Subclass 500 visa online via ImmiAccount.",
                admissionRequirements = "Academic minimum 60% in previous qualification. IELTS 6.0-6.5 overall (or PTE Academic 50-58). Proof of funds for tuition, 1 year living expenses, and return airfare.",
                topUniversities = listOf("University of Melbourne", "University of Sydney", "Monash University", "RMIT University", "University of Queensland"),
                flagEmoji = "🇦🇺"
            ),
            Destination(
                countryName = "United Kingdom",
                slug = "united-kingdom",
                capital = "London",
                currency = "GBP (£)",
                avgLivingCost = "GBP 12,000 - 15,000 / year",
                workRights = "20 hours per week during term time",
                visaSubclass = "Student Visa (Points-based System)",
                overview = "The UK is home to world-renowned universities, 1-year intensive Master's degrees, and the 2-year Graduate Route post-study work visa. Excellent for business, law, engineering, and data science.",
                visaProcess = "1. Receive unconditional offer and Confirmation of Acceptance for Studies (CAS).\n2. Maintain required living and tuition funds in bank for 28 consecutive days.\n3. Complete TB test from IOM accredited clinic.\n4. Apply online, pay Immigration Health Surcharge (IHS), and attend VFS biometrics.",
                admissionRequirements = "Minimum 55-60% in Bachelor's or Intermediate. IELTS 6.0-6.5 (PTE 59+). Strong Statement of Purpose (SOP).",
                topUniversities = listOf("University of Oxford", "University of Manchester", "University of Birmingham", "King's College London", "University of Leeds"),
                flagEmoji = "🇬🇧"
            ),
            Destination(
                countryName = "United States",
                slug = "usa",
                capital = "Washington, D.C.",
                currency = "USD ($)",
                avgLivingCost = "USD 14,000 - 18,000 / year",
                workRights = "20 hours per week on-campus; up to 3 years STEM OPT",
                visaSubclass = "F-1 Student Visa",
                overview = "The global hub for innovation, research funding, and career advancement. STEM graduates enjoy up to 36 months of Optional Practical Training (OPT) in American industries.",
                visaProcess = "1. Gain admission & obtain Form I-20 from designated school official (DSO).\n2. Pay SEVIS I-901 fee online.\n3. Submit DS-160 visa application form.\n4. Schedule & attend visa interview at the US Embassy in Islamabad.",
                admissionRequirements = "Minimum GPA 2.8-3.0 / 60%. TOEFL iBT 80+ or IELTS 6.5+. SAT/GRE scores depending on university policy.",
                topUniversities = listOf("MIT", "Stanford University", "New York University", "University of Texas at Austin", "Arizona State University"),
                flagEmoji = "🇺🇸"
            ),
            Destination(
                countryName = "Canada",
                slug = "canada",
                capital = "Ottawa",
                currency = "CAD ($)",
                avgLivingCost = "CAD 15,000 - 20,635 / year",
                workRights = "20-24 hours per week during semester",
                visaSubclass = "Study Permit (IRCC)",
                overview = "A welcoming, safe, and progressive country offering affordable education, Post-Graduation Work Permits (PGWP up to 3 years), and seamless pathway transitions.",
                visaProcess = "1. Obtain Letter of Acceptance (LOA) and Provincial Attestation Letter (PAL).\n2. Deposit GIC funds ($20,635 CAD) with an approved Canadian financial institution.\n3. Complete upfront medical examination.\n4. Lodge IRCC Study Permit application online and submit biometrics at VFS.",
                admissionRequirements = "Minimum 60% marks in relevant academic background. IELTS 6.0 minimum overall (PTE equivalent). Proof of financial stability.",
                topUniversities = listOf("University of Toronto", "UBC Vancouver", "McGill University", "Conestoga College", "Seneca Polytechnic"),
                flagEmoji = "🇨🇦"
            ),
            Destination(
                countryName = "Europe",
                slug = "europe",
                capital = "Various (Berlin, Rome, Stockholm)",
                currency = "EUR (€)",
                avgLivingCost = "EUR 8,000 - 12,000 / year",
                workRights = "15-20 hours per week depending on host nation",
                visaSubclass = "National D Long-term Student Visa",
                overview = "European institutions in Germany, Italy, Sweden, and Ireland offer tuition-free or subsidized world-class degrees taught completely in English.",
                visaProcess = "1. University admission letter & enrollment certificate.\n2. Open Blocked Account (e.g. Fintiba / Expatrio for Germany) with mandated living funds.\n3. Obtain overseas health insurance.\n4. Submit visa dossier at German/Italian/Irish Embassy.",
                admissionRequirements = "Minimum 60-65% academic score. IELTS 6.0 or verified English Proficiency Certificate from previous institution.",
                topUniversities = listOf("TU Munich", "Sapienza University Rome", "Trinity College Dublin", "Politecnico di Milano", "Lund University"),
                flagEmoji = "🇪🇺"
            )
        )
    )
    val destinations: StateFlow<List<Destination>> = _destinations.asStateFlow()

    private val _courses = MutableStateFlow(
        listOf(
            Course(
                title = "Diploma of Commercial Cookery & Hospitality",
                categorySlug = "trade-courses",
                country = "Australia",
                duration = "2 Years",
                estimatedFees = "AUD 13,000 - 16,500 / year",
                intakeMonths = "February, July, October",
                description = "Comprehensive practical culinary arts training including food safety standards, menu engineering, modern gastronomy, and commercial kitchen management. Direct alignment with Australian chef trade pathways.",
                careerPaths = "Chef de Partie, Sous Chef, Kitchen Executive, Restaurant Manager"
            ),
            Course(
                title = "Certificate III & IV in Heavy Automotive Technology",
                categorySlug = "trade-courses",
                country = "Australia",
                duration = "2 Years",
                estimatedFees = "AUD 14,000 / year",
                intakeMonths = "January, April, July",
                description = "Extensive mechanical workshop training covering electrical troubleshooting, diagnostic software, engine overhaul, and braking systems for light and heavy transport.",
                careerPaths = "Automotive Mechanic, Workshop Supervisor, Fleet Technician"
            ),
            Course(
                title = "Advanced Diploma of Information Technology (Cyber & Cloud)",
                categorySlug = "vocational-courses",
                country = "Australia",
                duration = "1.5 - 2 Years",
                estimatedFees = "AUD 11,500 / year",
                intakeMonths = "March, July, November",
                description = "Hands-on networking architectures, enterprise virtualization, threat defense, ethical hacking fundamentals, and AWS/Azure cloud infrastructure administration.",
                careerPaths = "Network Administrator, Cloud Operations Associate, Cybersecurity Analyst"
            ),
            Course(
                title = "Master of Business Administration (Global Management)",
                categorySlug = "higher-education",
                country = "United Kingdom",
                duration = "1 Year Intensive",
                estimatedFees = "GBP 13,500 - 16,000",
                intakeMonths = "January, September",
                description = "Fast-track executive qualification focusing on international trade, cross-border corporate finance, digital transformation, and strategic leadership with 2-year Graduate Route visa.",
                careerPaths = "Management Consultant, Business Operations Director, Venture Lead"
            ),
            Course(
                title = "Bachelor of Science in Computer Science & AI",
                categorySlug = "higher-education",
                country = "Canada",
                duration = "4 Years (with Co-op)",
                estimatedFees = "CAD 18,500 / year",
                intakeMonths = "September, January",
                description = "Foundational algorithms, distributed databases, machine learning, and interactive software engineering paired with paid Canadian industry co-op work terms.",
                careerPaths = "Software Engineer, Full Stack Developer, Machine Learning Engineer"
            ),
            Course(
                title = "Certificate IV in Building & Construction",
                categorySlug = "aqf-australia",
                country = "Australia",
                duration = "1 Year",
                estimatedFees = "AUD 9,800",
                intakeMonths = "Monthly Intakes",
                description = "AQF Level 4 accredited program providing complete knowledge of building codes, occupational health & safety, structural estimation, and site sub-contractor supervision.",
                careerPaths = "Building Site Supervisor, Estimator, Construction Contractor"
            ),
            Course(
                title = "High-Risk Work License Preparation (Forklift & Rigging)",
                categorySlug = "high-risk-courses",
                country = "Australia",
                duration = "3 - 6 Months",
                estimatedFees = "AUD 4,200",
                intakeMonths = "Continuous",
                description = "Specialized industrial equipment handling certification according to national WorkSafe guidelines. Prepares candidates for high-demand logistics and mining site roles.",
                careerPaths = "Forklift Operator, Rigging Specialist, Logistics Depot Lead"
            ),
            Course(
                title = "English for Academic Purposes & IELTS/PTE Masterclass",
                categorySlug = "short-courses",
                country = "Pakistan / Online",
                duration = "8 - 12 Weeks",
                estimatedFees = "PKR 35,000",
                intakeMonths = "Every Monday",
                description = "Intensive coaching covering listening, reading, writing task 1 & 2 structures, and interactive speaking mock interviews conducted by certified British Council & Pearson trainers.",
                careerPaths = "Band 7.0+ Achiever, University English Requirement Waiver"
            )
        )
    )
    val courses: StateFlow<List<Course>> = _courses.asStateFlow()

    private val _appointments = MutableStateFlow(
        listOf(
            Appointment(
                clientName = "Zubair Ahmad",
                email = "zubair.ahmad@gmail.com",
                phone = "+92 300 1234567",
                destination = "Australia",
                date = "2026-11-10",
                timeSlot = "10:00 AM - 11:00 AM",
                mode = AppointmentMode.OFFICE,
                status = AppointmentStatus.CONFIRMED,
                message = "Inquiry regarding Subclass 500 visa for Cookery course in Melbourne."
            ),
            Appointment(
                clientName = "Fatima Noor",
                email = "fatima.noor@outlook.com",
                phone = "+92 312 9876543",
                destination = "United Kingdom",
                date = "2026-11-10",
                timeSlot = "02:00 PM - 03:00 PM",
                mode = AppointmentMode.ONLINE,
                status = AppointmentStatus.CONFIRMED,
                message = "Wants counseling on 1-year Master's programs in London and CAS timeline."
            ),
            Appointment(
                clientName = "Bilal Hassan",
                email = "bilal.hassan@yahoo.com",
                phone = "+92 333 4567890",
                destination = "Canada",
                date = "2026-11-11",
                timeSlot = "11:00 AM - 12:00 PM",
                mode = AppointmentMode.OFFICE,
                status = AppointmentStatus.CONFIRMED,
                message = "Discussing GIC requirement and September 2027 intake."
            )
        )
    )
    val appointments: StateFlow<List<Appointment>> = _appointments.asStateFlow()

    private val _leads = MutableStateFlow(
        listOf(
            Lead(
                fullName = "Muhammad Ali",
                email = "ali.muhammad@gmail.com",
                phone = "+92 301 2345678",
                destination = "Australia",
                courseInterest = "Automotive Technology",
                status = LeadStatus.NEW,
                notes = "Graduated with DAE Mechanical. Interested in July intake.",
                createdAt = "Today, 10:15 AM"
            ),
            Lead(
                fullName = "Sana Tariq",
                email = "sana.tariq@gmail.com",
                phone = "+92 321 7654321",
                destination = "United Kingdom",
                courseInterest = "Master in Business Analytics",
                status = LeadStatus.CONTACTED,
                notes = "IELTS score 6.5. Sent university brochure list.",
                createdAt = "Yesterday"
            ),
            Lead(
                fullName = "Daniyal Qasim",
                email = "daniyal.qasim@gmail.com",
                phone = "+92 345 8899001",
                destination = "Canada",
                courseInterest = "Software Engineering",
                status = LeadStatus.IN_PROGRESS,
                notes = "Transcripts assessed. Waiting on bank statement verification.",
                createdAt = "3 days ago"
            ),
            Lead(
                fullName = "Khadija Bibi",
                email = "khadija.bibi@yahoo.com",
                phone = "+92 333 1122334",
                destination = "Australia",
                courseInterest = "Commercial Cookery",
                status = LeadStatus.CONVERTED,
                notes = "Offer letter received from Melbourne Culinary Institute. Preparing eCoE.",
                createdAt = "5 days ago"
            )
        )
    )
    val leads: StateFlow<List<Lead>> = _leads.asStateFlow()

    private val _studentCase = MutableStateFlow(
        StudentCase(
            fullName = "Khadija Bibi",
            email = "khadija.bibi@yahoo.com",
            phone = "+92 333 1122334",
            targetCountry = "Australia",
            targetUniversity = "Melbourne Institute of Culinary Arts",
            courseTitle = "Diploma of Commercial Cookery",
            visaStage = "eCoE Received & Medical Examination",
            progressPercent = 0.75f,
            documents = listOf(
                DocumentItem(name = "Passport Biodata Pages", required = true, isUploaded = true, isVerified = true),
                DocumentItem(name = "Matric & Intermediate Certificates", required = true, isUploaded = true, isVerified = true),
                DocumentItem(name = "PTE / IELTS Score Card", required = true, isUploaded = true, isVerified = true),
                DocumentItem(name = "Genuine Student (GS) Statement", required = true, isUploaded = true, isVerified = true),
                DocumentItem(name = "Bank Statement & Source Proofs", required = true, isUploaded = true, isVerified = false, remarks = "Awaiting CA valuation report"),
                DocumentItem(name = "BAP Panel Medical Report", required = true, isUploaded = false, isVerified = false, remarks = "Scheduled at IOM clinic")
            )
        )
    )
    val studentCase: StateFlow<StudentCase> = _studentCase.asStateFlow()

    private val _testimonials = MutableStateFlow(
        listOf(
            Testimonial(
                studentName = "Hamza Tariq",
                university = "University of Melbourne",
                country = "Australia",
                quote = "SR Global Consultants guided my Australian Subclass 500 visa with utter transparency. Sir Ghulam Mustafa and the Gujranwala team structured my SOP brilliantly. Visa granted in just 14 days!",
                rating = 5,
                year = "2025"
            ),
            Testimonial(
                studentName = "Ayesha Malik",
                university = "University of Manchester",
                country = "United Kingdom",
                quote = "Outstanding guidance for my Master's admission in the UK. From IELTS preparation to the 28-day bank statement review, they monitored every detail. I recommend them with 100% confidence.",
                rating = 5,
                year = "2025"
            ),
            Testimonial(
                studentName = "Usman Farooq",
                university = "Conestoga College",
                country = "Canada",
                quote = "Despite having a 3-year study gap after my graduation, SR Global demonstrated my career progression so convincingly that IRCC approved my study permit smoothly. Best consultants in Gujranwala!",
                rating = 5,
                year = "2024"
            )
        )
    )
    val testimonials: StateFlow<List<Testimonial>> = _testimonials.asStateFlow()

    val standardTimeSlots = listOf(
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
        "05:00 PM - 06:00 PM"
    )

    // Double-Booking Prevention Rule: Checks if slot is already reserved for this date
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
            slot to !isBooked // true = available, false = booked
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
            return Result.failure(IllegalStateException("The slot '$timeSlot' on $date has already been booked. Please choose another available slot."))
        }

        val newAppointment = Appointment(
            clientName = clientName,
            email = email,
            phone = phone,
            destination = destination,
            date = date,
            timeSlot = timeSlot,
            mode = mode,
            status = AppointmentStatus.CONFIRMED,
            message = message
        )

        _appointments.update { listOf(newAppointment) + it }
        // Trigger live cloud sync to Supabase project
        scope.launch {
            supabaseClient.syncAppointmentToSupabase(newAppointment)
        }

        // Also auto-record a lead for CRM pipeline
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
        // Trigger live cloud sync to Supabase project
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

    private val _bannerSlides = MutableStateFlow(
        listOf(
            BannerSlide(
                id = "slide-1",
                tag = "AUSTRALIA SUBCLASS 500 & 485",
                title = "Study & Settle in Australia",
                subtitle = "Authorized admission & visa processing for AQF Trade, Vocational & University programs with high approval rate.",
                highlight = "Sydney • Melbourne • Brisbane",
                buttonText = "Explore Australia Pathways",
                actionTab = "DESTINATIONS",
                gradientStart = 0xFF0A192F,
                gradientEnd = 0xFF1B75BC
            ),
            BannerSlide(
                id = "slide-2",
                tag = "UK MASTERS & GRADUATE ROUTE",
                title = "Fast-Track UK University Admissions",
                subtitle = "Apply for upcoming intakes with scholarship opportunities up to £5,000 and 2-year post-study work visa.",
                highlight = "September & January Intakes Open",
                buttonText = "Book UK Counseling",
                actionTab = "APPOINTMENT",
                gradientStart = 0xFF1B75BC,
                gradientEnd = 0xFF6A8D45
            ),
            BannerSlide(
                id = "slide-3",
                tag = "HIGH-DEMAND TRADE OCCUPATIONS",
                title = "Commercial Cookery, Automotive & IT",
                subtitle = "Practical vocational programs leading to recognized Australian Qualification Framework (AQF) certifications.",
                highlight = "Job Ready Programme Support",
                buttonText = "View Trade Courses",
                actionTab = "COURSES",
                gradientStart = 0xFF0D2538,
                gradientEnd = 0xFF1B75BC
            ),
            BannerSlide(
                id = "slide-4",
                tag = "OFFICIAL TEST PREPARATION",
                title = "IELTS & PTE Academic Coaching",
                subtitle = "Specialized score improvement batches in Gujranwala with mock tests, computerized lab, and certified trainers.",
                highlight = "Target Band 7.0+ & PTE 65+",
                buttonText = "Register for Demo Class",
                actionTab = "APPOINTMENT",
                gradientStart = 0xFF6A8D45,
                gradientEnd = 0xFF0A192F
            )
        )
    )
    val bannerSlides: StateFlow<List<BannerSlide>> = _bannerSlides.asStateFlow()

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

    fun verifyAdminPin(enteredPin: String): Boolean {
        // Standard admin access code
        return enteredPin == "1234" || enteredPin == "0000"
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
