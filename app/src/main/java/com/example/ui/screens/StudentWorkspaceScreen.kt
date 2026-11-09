package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.SectionHeader
import com.example.ui.components.launchWhatsApp
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel

@Composable
fun StudentWorkspaceScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val studentCase by viewModel.studentCase.collectAsState()
    val contact by viewModel.contact.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateBackground),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            SectionHeader(
                title = "Applicant Workspace",
                subtitle = "Track your admissions progress, manage visa checklist documents, and review counselor updates.",
                badgeText = "Live Case Tracker"
            )
        }

        // Appointment Status Tracker Search Box
        item {
            var searchCode by remember { mutableStateOf("") }
            var foundAppt by remember { mutableStateOf<com.example.model.Appointment?>(null) }
            var searched by remember { mutableStateOf(false) }

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth().testTag("track_appointment_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Track Appointment Status",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                    )
                    Text(
                        text = "Enter your Reference ID (e.g. SRG-APT-8492) or registered phone number",
                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary, fontSize = 11.sp)
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = searchCode,
                            onValueChange = { searchCode = it },
                            placeholder = { Text("SRG-APT-8492", fontSize = 12.sp) },
                            singleLine = true,
                            modifier = Modifier.weight(1f).testTag("track_code_input")
                        )
                        Button(
                            onClick = {
                                foundAppt = viewModel.repository.findAppointmentByCodeOrPhone(searchCode)
                                searched = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = AegeanCyan, contentColor = Color.White),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Search", fontWeight = FontWeight.Bold)
                        }
                    }

                    if (searched) {
                        Spacer(modifier = Modifier.height(12.dp))
                        if (foundAppt != null) {
                            val appt = foundAppt!!
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = SlateBackground,
                                border = ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(SlateBorder)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = appt.appointmentCode.ifEmpty { "SRG-APT-8492" },
                                            style = MaterialTheme.typography.titleMedium.copy(
                                                fontWeight = FontWeight.Black,
                                                color = NavyDark
                                            )
                                        )
                                        Surface(
                                            shape = RoundedCornerShape(20.dp),
                                            color = when (appt.status) {
                                                com.example.model.AppointmentStatus.CONFIRMED -> SuccessGreen
                                                com.example.model.AppointmentStatus.PENDING -> AmberGold
                                                else -> AegeanCyan
                                            }
                                        ) {
                                            Text(
                                                text = appt.status.label.uppercase(),
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White,
                                                    fontSize = 9.sp
                                                ),
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "${appt.clientName} • ${appt.destination}",
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                                    )
                                    Text(
                                        text = "Date: ${appt.date} at ${appt.timeSlot} (${appt.mode.label})",
                                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                                    )

                                    if (appt.status == com.example.model.AppointmentStatus.PENDING) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "● Action Needed: Please send your consultation fee receipt via WhatsApp to get your slot confirmed.",
                                            style = MaterialTheme.typography.labelSmall.copy(color = ErrorRed, fontWeight = FontWeight.Bold)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))
                                    Button(
                                        onClick = {
                                            launchWhatsApp(
                                                context,
                                                contact.whatsappNumber,
                                                "Hello SR Global Consultants! My Appointment Reference ID is ${appt.appointmentCode}. I am checking my slot status for ${appt.date}."
                                            )
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = WhatsAppGreen, contentColor = Color.White),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("Chat on WhatsApp", fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        } else {
                            Text(
                                text = "No appointment found for '$searchCode'. Check Reference ID or phone number.",
                                style = MaterialTheme.typography.bodySmall.copy(color = ErrorRed, fontWeight = FontWeight.Bold)
                            )
                        }
                    }
                }
            }
        }

        // Student Case Summary Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyDark),
                modifier = Modifier.fillMaxWidth().testTag("student_case_card")
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = studentCase.fullName,
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            )
                            Text(
                                text = "Target: ${studentCase.targetCountry} • ${studentCase.targetUniversity}",
                                style = MaterialTheme.typography.bodySmall.copy(color = AmberLight)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = AmberGold
                        ) {
                            Text(
                                text = "ACTIVE FILE",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = NavyDeep,
                                    fontSize = 10.sp
                                ),
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Current Stage: ${studentCase.visaStage}",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Progress Bar
                    LinearProgressIndicator(
                        progress = { studentCase.progressPercent },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = AmberGold,
                        trackColor = Color.White.copy(alpha = 0.2f),
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Stage Progress",
                            style = MaterialTheme.typography.labelSmall.copy(color = Color.White.copy(alpha = 0.7f))
                        )
                        Text(
                            text = "${(studentCase.progressPercent * 100).toInt()}% Ready for Lodgement",
                            style = MaterialTheme.typography.labelSmall.copy(color = AmberLight, fontWeight = FontWeight.Bold)
                        )
                    }
                }
            }
        }

        // Document Checklist
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Visa Document Checklist",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                        )
                        Text(
                            text = "Tap item to update",
                            style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    studentCase.documents.forEach { doc ->
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = SlateBackground,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clickable { viewModel.toggleDocumentUpload(doc.id) }
                                .testTag("doc_item_${doc.id}")
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(
                                        imageVector = if (doc.isUploaded) Icons.Default.CheckCircle else Icons.Outlined.CloudUpload,
                                        contentDescription = null,
                                        tint = if (doc.isUploaded) SuccessGreen else AccentCyan,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = doc.name,
                                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold, color = NavyDark)
                                        )
                                        if (doc.remarks.isNotBlank()) {
                                            Text(
                                                text = doc.remarks,
                                                style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary, fontSize = 11.sp)
                                            )
                                        }
                                    }
                                }

                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (doc.isUploaded) (if (doc.isVerified) SuccessGreen.copy(alpha = 0.15f) else AmberPale) else Color(0xFFF1F5F9)
                                ) {
                                    Text(
                                        text = when {
                                            doc.isVerified -> "Verified"
                                            doc.isUploaded -> "Uploaded (Pending Review)"
                                            else -> "Required"
                                        },
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = when {
                                                doc.isVerified -> SuccessGreen
                                                doc.isUploaded -> AmberGold
                                                else -> SlateTextSecondary
                                            },
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 10.sp
                                        ),
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Assigned Counselor Card
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Assigned Senior Counselor",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(NavyDark),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = AmberGold)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Sir Ghulam Mustafa", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                            Text("Head of Migration & Counseling", style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary))
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            launchWhatsApp(
                                context,
                                contact.whatsappNumber,
                                "Hello Sir Ghulam Mustafa, I am checking on my active case file at SR Global Consultants."
                            )
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = WhatsAppGreen,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .minimumInteractiveComponentSize()
                            .testTag("counselor_chat_button")
                    ) {
                        Icon(imageVector = Icons.Default.Chat, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Direct Chat on WhatsApp", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
