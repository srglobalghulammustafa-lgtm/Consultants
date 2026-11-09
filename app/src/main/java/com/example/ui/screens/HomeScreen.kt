package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Destination
import com.example.model.Testimonial
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel
import com.example.ui.viewmodel.NavTab

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val contact by viewModel.contact.collectAsState()
    val metrics by viewModel.metrics.collectAsState()
    val destinations by viewModel.destinations.collectAsState()
    val testimonials by viewModel.testimonials.collectAsState()
    val bannerSlides by viewModel.bannerSlides.collectAsState()
    val activeBroadcast by viewModel.activeBroadcast.collectAsState()
    val inquirySuccess by viewModel.inquirySuccessMessage.collectAsState()

    var inqName by remember { mutableStateOf("") }
    var inqEmail by remember { mutableStateOf("") }
    var inqPhone by remember { mutableStateOf("") }
    var inqDest by remember { mutableStateOf("Australia") }
    var inqCourse by remember { mutableStateOf("Vocational & Trade Courses") }
    var inqNotes by remember { mutableStateOf("") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateBackground),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // 0. BROADCAST BANNER
        if (activeBroadcast != null) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .clickable {
                            activeBroadcast?.link?.let { link ->
                                // Optional: link handling
                            }
                        },
                    colors = CardDefaults.cardColors(
                        containerColor = if (activeBroadcast?.priority == "Urgent") Color(0xFFD32F2F) else AmberGold
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (activeBroadcast?.priority == "Urgent") Icons.Default.Warning else Icons.Default.Campaign,
                            contentDescription = null,
                            tint = if (activeBroadcast?.priority == "Urgent") Color.White else NavyDark,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = activeBroadcast?.title ?: "",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (activeBroadcast?.priority == "Urgent") Color.White else NavyDark
                                )
                            )
                            Text(
                                text = activeBroadcast?.message ?: "",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = if (activeBroadcast?.priority == "Urgent") Color.White.copy(alpha = 0.9f) else NavyDark.copy(alpha = 0.8f)
                                )
                            )
                        }
                    }
                }
            }
        }

        // 1. HERO SECTION
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(AegeanCyan, AegeanCyanDark)
                        )
                    )
                    .padding(horizontal = 20.dp, vertical = 24.dp)
            ) {
                Column {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = AmberGold.copy(alpha = 0.15f),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = Brush.linearGradient(listOf(AmberGold, AmberLight))
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Verified,
                                contentDescription = null,
                                tint = AmberLight,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "OFFICIAL EDUCATION & VISA COUNSELORS",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = AmberLight,
                                    letterSpacing = 0.5.sp
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Your Gateway to Global Education & Migration Success",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White,
                            lineHeight = 34.sp
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Expert guidance for Australian AQF Trade & Vocational courses, UK Masters, Canadian study permits, and European universities. Based in Gujranwala with authorized Australia branches.",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White.copy(alpha = 0.85f),
                            lineHeight = 22.sp
                        )
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = { viewModel.setTab(NavTab.APPOINTMENT) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AmberGold,
                                contentColor = NavyDeep
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .testTag("hero_book_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.CalendarToday,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Book Appointment",
                                fontWeight = FontWeight.Bold
                            )
                        }

                        OutlinedButton(
                            onClick = { viewModel.setTab(NavTab.COURSES) },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.White
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = Brush.linearGradient(listOf(Color.White, AmberPale))
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .testTag("hero_courses_button")
                        ) {
                            Text(
                                text = "Browse Courses",
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }

        // 1B. HIGHLIGHT SLIDER BANNER
        item {
            HomeSliderBanner(
                slides = bannerSlides,
                onSlideActionClick = { actionTab ->
                    when (actionTab) {
                        "DESTINATIONS" -> viewModel.setTab(NavTab.DESTINATIONS)
                        "COURSES" -> viewModel.setTab(NavTab.COURSES)
                        "APPOINTMENT" -> viewModel.setTab(NavTab.APPOINTMENT)
                        "CONTACT" -> viewModel.setTab(NavTab.CONTACT)
                        else -> viewModel.setTab(NavTab.APPOINTMENT)
                    }
                }
            )
        }

        // 2. METRIC COUNTERS
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .offset(y = (-14).dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    MetricItem(count = "5,200+", label = "Students Guided", color = AccentCyan)
                    MetricItem(count = "160+", label = "Universities", color = AmberGold)
                    MetricItem(count = "98.4%", label = "Visa Success", color = SuccessGreen)
                    MetricItem(count = "12+ Yrs", label = "Experience", color = NavyDark)
                }
            }
        }

        // 3. STUDY DESTINATIONS OVERVIEW
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    SectionHeader(
                        title = "Study Destinations",
                        subtitle = "Select a country to review admission criteria and visa timelines",
                        badgeText = "Global Pathways"
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(destinations) { destination ->
                        DestinationCard(
                            destination = destination,
                            onClick = {
                                viewModel.selectDestination(destination)
                                viewModel.setTab(NavTab.DESTINATIONS)
                            }
                        )
                    }
                }
            }
        }

        // 4. CORE SERVICES SECTION
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                SectionHeader(
                    title = "Our Core Services",
                    subtitle = "Comprehensive support from initial course counseling to post-landing settlement",
                    badgeText = "What We Offer"
                )

                Spacer(modifier = Modifier.height(14.dp))

                val services = listOf(
                    ServiceItem(Icons.Default.SupportAgent, "Student Counseling", "Personalized assessment matching your background, budget, and career goals with international colleges."),
                    ServiceItem(Icons.Default.AssignmentTurnedIn, "Admissions & Offers", "Direct liaison with partner university admissions teams for expedited conditional and unconditional offers."),
                    ServiceItem(Icons.Default.VerifiedUser, "Visa Documentation", "Complete Statement of Purpose (SOP), Genuine Student (GS) statements, and financial file preparation."),
                    ServiceItem(Icons.Default.MenuBook, "IELTS & PTE Coaching", "Rigorous preparation classes in Gujranwala with proven test-taking strategies to secure targeted band scores."),
                    ServiceItem(Icons.Default.MonetizationOn, "Scholarship Assistance", "Merit and regional scholarship guidance to minimize international student tuition fees."),
                    ServiceItem(Icons.Default.FlightLand, "Pre-Departure & Accommodation", "Flight arrangements, briefing on overseas work regulations, airport pickup, and student accommodation.")
                )

                services.chunked(2).forEach { rowServices ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        rowServices.forEach { service ->
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                elevation = CardDefaults.cardElevation(2.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(bottom = 12.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(AccentCyanLight),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = service.icon,
                                            contentDescription = service.title,
                                            tint = AccentCyan,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(
                                        text = service.title,
                                        style = MaterialTheme.typography.titleSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = NavyDark
                                        )
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = service.description,
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = SlateTextSecondary,
                                            lineHeight = 16.sp
                                        ),
                                        maxLines = 4
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 5. QUICK INQUIRY FORM
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyDark),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Quick Inquiry / Free Assessment",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    )
                    Text(
                        text = "Leave your contact details and our senior counselor will evaluate your profile within 2 hours.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = inqName,
                        onValueChange = { inqName = it },
                        label = { Text("Full Name", color = Color.White.copy(alpha = 0.7f)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = AmberGold,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("inquiry_name_input")
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = inqPhone,
                            onValueChange = { inqPhone = it },
                            label = { Text("Phone / WhatsApp", color = Color.White.copy(alpha = 0.7f)) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = AmberGold,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("inquiry_phone_input")
                        )

                        OutlinedTextField(
                            value = inqEmail,
                            onValueChange = { inqEmail = it },
                            label = { Text("Email", color = Color.White.copy(alpha = 0.7f)) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = AmberGold,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("inquiry_email_input")
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = inqDest,
                        onValueChange = { inqDest = it },
                        label = { Text("Preferred Country (e.g. Australia, UK)", color = Color.White.copy(alpha = 0.7f)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = AmberGold,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = inqNotes,
                        onValueChange = { inqNotes = it },
                        label = { Text("Current qualification & questions", color = Color.White.copy(alpha = 0.7f)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = AmberGold,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                        ),
                        minLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    if (inquirySuccess != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = SuccessGreen.copy(alpha = 0.2f),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = Brush.linearGradient(listOf(SuccessGreen, SuccessGreen))
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 12.dp)
                        ) {
                            Text(
                                text = inquirySuccess ?: "",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Medium
                                ),
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }

                    Button(
                        onClick = {
                            if (inqName.isNotBlank() && inqPhone.isNotBlank()) {
                                viewModel.submitQuickInquiry(
                                    fullName = inqName,
                                    email = inqEmail,
                                    phone = inqPhone,
                                    destination = inqDest,
                                    courseInterest = inqCourse,
                                    notes = inqNotes
                                )
                                inqName = ""
                                inqPhone = ""
                                inqEmail = ""
                                inqNotes = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AmberGold,
                            contentColor = NavyDeep
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .minimumInteractiveComponentSize()
                            .testTag("submit_inquiry_button")
                    ) {
                        Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Submit Inquiry Now",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // 6. TESTIMONIALS
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                SectionHeader(
                    title = "Student Success Stories",
                    subtitle = "Real feedback from students whose visas and admissions were processed by SR Global",
                    badgeText = "Verified Visas"
                )

                Spacer(modifier = Modifier.height(12.dp))

                testimonials.forEach { testimonial ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(2.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(CircleShape)
                                            .background(NavyCard),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (!testimonial.imageUrl.isNullOrBlank()) {
                                            val finalImageUrl = viewModel.fixGoogleDriveLink(testimonial.imageUrl)
                                            coil.compose.AsyncImage(
                                                model = finalImageUrl,
                                                contentDescription = testimonial.studentName,
                                                modifier = Modifier.fillMaxSize(),
                                                contentScale = androidx.compose.ui.layout.ContentScale.Crop
                                            )
                                        } else {
                                            Text(
                                                text = testimonial.studentName.take(1),
                                                style = MaterialTheme.typography.titleMedium.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = AmberGold
                                                )
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(
                                            text = testimonial.studentName,
                                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                                        )
                                        Text(
                                            text = "${testimonial.university} • ${testimonial.country}",
                                            style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary, fontSize = 11.sp)
                                        )
                                    }
                                }
                                Row {
                                    repeat(testimonial.rating) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = AmberGold,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "“${testimonial.quote}”",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = SlateTextPrimary,
                                    lineHeight = 20.sp
                                )
                            )
                        }
                    }
                }
            }
        }

        // 7. LOCATION & OFFICE CARD
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                elevation = CardDefaults.cardElevation(3.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Storefront, contentDescription = null, tint = AmberGold)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Visit Our Head Office",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = contact.address,
                        style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextSecondary)
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Office Hours: ${contact.officeHours}",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = AccentCyan,
                            fontWeight = FontWeight.Medium
                        )
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                launchGoogleMaps(context, contact.latitude, contact.longitude, "SR Global Consultants")
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = NavyDark,
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .testTag("open_maps_button")
                        ) {
                            Icon(imageVector = Icons.Default.Map, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Open Map", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = {
                                launchPhoneCall(context, contact.phonePakistan)
                            },
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = AegeanCyanLight,
                                contentColor = NavyDark
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.dp, AegeanCyan),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .testTag("call_pk_button")
                        ) {
                            Icon(imageVector = Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp), tint = SuccessGreen)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Call Gujranwala", color = NavyDark, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MetricItem(count: String, label: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = count,
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.ExtraBold,
                color = color
            )
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                color = SlateTextSecondary,
                fontSize = 10.sp
            )
        )
    }
}

@Composable
fun DestinationCard(
    destination: Destination,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(3.dp),
        modifier = Modifier
            .width(180.dp)
            .clickable { onClick() }
            .testTag("destination_card_${destination.slug}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = destination.flagEmoji, fontSize = 28.sp)
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = AccentCyanLight
                ) {
                    Text(
                        text = destination.currency,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = AccentCyan,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        ),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = destination.countryName,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = NavyDark
                )
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = destination.visaSubclass,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = AmberGold,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 11.sp
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Living: ${destination.avgLivingCost.take(15)}...",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = SlateTextSecondary,
                    fontSize = 11.sp
                )
            )
        }
    }
}

data class ServiceItem(
    val icon: ImageVector,
    val title: String,
    val description: String
)
