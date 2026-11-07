package com.example.ui.screens

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.components.launchWhatsApp
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel

@Composable
fun AdminDashboardScreen(
    viewModel: MainViewModel,
    onExitAdmin: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val leads by viewModel.leads.collectAsState()
    val appointments by viewModel.appointments.collectAsState()
    val courses by viewModel.courses.collectAsState()
    val metrics by viewModel.metrics.collectAsState()
    val contact by viewModel.contact.collectAsState()
    val notificationMsg by viewModel.notificationSuccessMessage.collectAsState()

    var activeAdminTab by remember { mutableStateOf(AdminSubTab.LEADS) }
    var selectedLeadFilter by remember { mutableStateOf<LeadStatus?>(null) }
    var showCsvDialog by remember { mutableStateOf(false) }
    var csvContent by remember { mutableStateOf("") }

    var editingLead by remember { mutableStateOf<Lead?>(null) }
    var newLeadNote by remember { mutableStateOf("") }

    var notifTitle by remember { mutableStateOf("New Intake Announcement: Australia 2025/2026") }
    var notifBody by remember { mutableStateOf("Admissions are open for AQF Trade & Masters degrees at SR Global Gujranwala. Fast-track your visa application today!") }

    var editWhatsapp by remember(contact) { mutableStateOf(contact.whatsappNumber) }
    var editPakPhone by remember(contact) { mutableStateOf(contact.phonePakistan) }
    var editAusPhone by remember(contact) { mutableStateOf(contact.phoneAustralia) }
    var editEmail by remember(contact) { mutableStateOf(contact.email) }
    var editFb by remember(contact) { mutableStateOf(contact.facebook) }
    var editTwitter by remember(contact) { mutableStateOf(contact.twitter) }
    var editLinkedIn by remember(contact) { mutableStateOf(contact.linkedin) }
    var settingsSavedMsg by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // ADMIN HEADER
        Surface(
            color = NavyDark,
            tonalElevation = 6.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onExitAdmin) {
                            Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Exit Admin", tint = Color.White)
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Column {
                            Text(
                                text = "CONSULTANT CRM & ADMIN",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = AmberLight,
                                    letterSpacing = 1.sp
                                )
                            )
                            Text(
                                text = "SR Global • Gujranwala Head Office",
                                style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = {
                            csvContent = viewModel.repository.exportLeadsCsv()
                            showCsvDialog = true
                        },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = AmberGold),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = androidx.compose.ui.graphics.SolidColor(AmberGold)
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.minimumInteractiveComponentSize().testTag("export_csv_button")
                    ) {
                        Icon(imageVector = Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Export CSV", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Admin Sub Tabs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    AdminSubTab.values().forEach { tab ->
                        val isSelected = activeAdminTab == tab
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) AmberGold else Color.White.copy(alpha = 0.1f),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { activeAdminTab = tab }
                                .testTag("admin_tab_${tab.name.lowercase()}")
                        ) {
                            Text(
                                text = tab.title,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = if (isSelected) NavyDeep else Color.White,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                ),
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // KPI METRICS ROW
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    KpiCard(
                        title = "Total Inquiries",
                        value = "${leads.size}",
                        icon = Icons.Default.PersonSearch,
                        color = AccentCyan,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Appointments",
                        value = "${appointments.size}",
                        icon = Icons.Default.Event,
                        color = AmberGold,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Active Courses",
                        value = "${courses.size}",
                        icon = Icons.Default.School,
                        color = SuccessGreen,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            when (activeAdminTab) {
                AdminSubTab.LEADS -> {
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Inquiries Pipeline",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                            )

                            // Status Filter Chips
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                item {
                                    FilterChip(
                                        selected = selectedLeadFilter == null,
                                        onClick = { selectedLeadFilter = null },
                                        label = { Text("All (${leads.size})", fontSize = 10.sp) }
                                    )
                                }
                                items(LeadStatus.values()) { status ->
                                    val count = leads.count { it.status == status }
                                    FilterChip(
                                        selected = selectedLeadFilter == status,
                                        onClick = { selectedLeadFilter = status },
                                        label = { Text("${status.label} ($count)", fontSize = 10.sp) }
                                    )
                                }
                            }
                        }
                    }

                    val filteredLeads = leads.filter {
                        selectedLeadFilter == null || it.status == selectedLeadFilter
                    }

                    if (filteredLeads.isEmpty()) {
                        item {
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)
                            ) {
                                Text(
                                    text = "No inquiries in this pipeline stage.",
                                    modifier = Modifier.padding(20.dp),
                                    style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextSecondary)
                                )
                            }
                        }
                    } else {
                        items(filteredLeads) { lead ->
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                elevation = CardDefaults.cardElevation(2.dp),
                                modifier = Modifier.fillMaxWidth().testTag("lead_card_${lead.id}")
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = lead.fullName,
                                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                                        )
                                        LeadStatusBadge(lead.status)
                                    }

                                    Spacer(modifier = Modifier.height(4.dp))

                                    Text(
                                        text = "${lead.phone} • ${lead.email}",
                                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                                    )
                                    Text(
                                        text = "Country: ${lead.destination} • Course: ${lead.courseInterest}",
                                        style = MaterialTheme.typography.bodySmall.copy(color = AccentCyan, fontWeight = FontWeight.Medium)
                                    )

                                    if (lead.notes.isNotBlank()) {
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = SlateBackground,
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text(
                                                text = "Notes: ${lead.notes}",
                                                style = MaterialTheme.typography.bodySmall.copy(color = SlateTextPrimary, fontSize = 11.sp),
                                                modifier = Modifier.padding(8.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    // Action buttons: Update status & WhatsApp
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Button(
                                            onClick = {
                                                launchWhatsApp(context, lead.phone, "Hello ${lead.fullName}, this is SR Global Consultants following up on your inquiry.")
                                            },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = WhatsAppGreen,
                                                contentColor = Color.White
                                            ),
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.weight(1f).minimumInteractiveComponentSize()
                                        ) {
                                            Icon(imageVector = Icons.Default.Chat, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("WhatsApp", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }

                                        OutlinedButton(
                                            onClick = {
                                                editingLead = lead
                                                newLeadNote = lead.notes
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.weight(1f).minimumInteractiveComponentSize()
                                        ) {
                                            Icon(imageVector = Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Update Stage", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                AdminSubTab.APPOINTMENTS -> {
                    item {
                        Text(
                            text = "Scheduled Consultations",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                        )
                    }

                    items(appointments) { appt ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(2.dp),
                            modifier = Modifier.fillMaxWidth().testTag("admin_appt_${appt.id}")
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(text = appt.clientName, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = NavyDark))
                                        Text(text = "${appt.date} • ${appt.timeSlot}", style = MaterialTheme.typography.bodySmall.copy(color = AmberGold, fontWeight = FontWeight.Bold))
                                    }
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (appt.status == AppointmentStatus.CONFIRMED) SuccessGreen.copy(alpha = 0.15f) else AmberPale
                                    ) {
                                        Text(
                                            text = appt.status.label,
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                color = if (appt.status == AppointmentStatus.CONFIRMED) SuccessGreen else AmberGold,
                                                fontWeight = FontWeight.Bold
                                            ),
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(text = "Mode: ${appt.mode.label} • Destination: ${appt.destination}", style = MaterialTheme.typography.bodySmall)
                                Text(text = "Contact: ${appt.phone} • ${appt.email}", style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary))

                                if (appt.message.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(text = "Inquiry: ${appt.message}", style = MaterialTheme.typography.bodySmall.copy(color = SlateTextPrimary))
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    if (appt.status != AppointmentStatus.COMPLETED) {
                                        Button(
                                            onClick = { viewModel.updateAppointmentStatus(appt.id, AppointmentStatus.COMPLETED) },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = SuccessGreen,
                                                contentColor = Color.White
                                            ),
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.weight(1f).minimumInteractiveComponentSize()
                                        ) {
                                            Text("Mark Completed", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }

                                    if (appt.status != AppointmentStatus.CANCELLED) {
                                        OutlinedButton(
                                            onClick = { viewModel.updateAppointmentStatus(appt.id, AppointmentStatus.CANCELLED) },
                                            colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed),
                                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                                brush = androidx.compose.ui.graphics.SolidColor(ErrorRed)
                                            ),
                                            shape = RoundedCornerShape(8.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.weight(1f).minimumInteractiveComponentSize()
                                        ) {
                                            Text("Cancel", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                AdminSubTab.SETTINGS -> {
                    // PUSH NOTIFICATION BROADCASTER
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(3.dp),
                            modifier = Modifier.fillMaxWidth().testTag("admin_notification_card")
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.NotificationsActive,
                                        contentDescription = null,
                                        tint = AccentCyan,
                                        modifier = Modifier.size(22.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(
                                            text = "Broadcast Status Bar Notification",
                                            style = MaterialTheme.typography.titleMedium.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = NavyDark
                                            )
                                        )
                                        Text(
                                            text = "Sends an alert to user status bar even when app is minimized",
                                            style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary, fontSize = 11.sp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                OutlinedTextField(
                                    value = notifTitle,
                                    onValueChange = { notifTitle = it },
                                    label = { Text("Notification Title") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth().testTag("notif_title_input")
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                OutlinedTextField(
                                    value = notifBody,
                                    onValueChange = { notifBody = it },
                                    label = { Text("Notification Message") },
                                    minLines = 2,
                                    modifier = Modifier.fillMaxWidth().testTag("notif_body_input")
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                Button(
                                    onClick = {
                                        viewModel.sendBroadcastNotification(context, notifTitle, notifBody)
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = AccentCyan,
                                        contentColor = Color.White
                                    ),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth().testTag("send_notification_button")
                                ) {
                                    Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Dispatch Status Bar Notification", fontWeight = FontWeight.Bold)
                                }

                                if (notificationMsg != null) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = SuccessGreen.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "✓ $notificationMsg",
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = SuccessGreen,
                                                fontWeight = FontWeight.Bold
                                            ),
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // CONTACT & SOCIAL HANDLES EDITOR
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(3.dp),
                            modifier = Modifier.fillMaxWidth().testTag("admin_settings_card")
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Manage Public Contact & Social Handles",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = NavyDark
                                    )
                                )
                                Text(
                                    text = "Changes apply instantly to mobile app and web portal",
                                    style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary, fontSize = 11.sp)
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                OutlinedTextField(
                                    value = editWhatsapp,
                                    onValueChange = { editWhatsapp = it },
                                    label = { Text("WhatsApp Number (no plus/spaces)") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = editPakPhone,
                                    onValueChange = { editPakPhone = it },
                                    label = { Text("Pakistan Helpline") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = editAusPhone,
                                    onValueChange = { editAusPhone = it },
                                    label = { Text("Australia Office Helpline") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = editEmail,
                                    onValueChange = { editEmail = it },
                                    label = { Text("Official Email") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = editFb,
                                    onValueChange = { editFb = it },
                                    label = { Text("Facebook URL") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = editTwitter,
                                    onValueChange = { editTwitter = it },
                                    label = { Text("X (Twitter) URL") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = editLinkedIn,
                                    onValueChange = { editLinkedIn = it },
                                    label = { Text("LinkedIn URL") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                Button(
                                    onClick = {
                                        viewModel.updateContact(
                                            contact.copy(
                                                whatsappNumber = editWhatsapp,
                                                phonePakistan = editPakPhone,
                                                phoneAustralia = editAusPhone,
                                                email = editEmail,
                                                facebook = editFb,
                                                twitter = editTwitter,
                                                linkedin = editLinkedIn
                                            )
                                        )
                                        settingsSavedMsg = "Company contact & social handles updated successfully!"
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = NavyDark,
                                        contentColor = Color.White
                                    ),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(imageVector = Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Save Contact & Social Settings", fontWeight = FontWeight.Bold)
                                }

                                if (settingsSavedMsg != null) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "✓ $settingsSavedMsg",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = SuccessGreen,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // OPERATIONAL METRICS
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(2.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Operational Metrics & System Info",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Text("Students Guided: ${metrics.studentsGuided}", style = MaterialTheme.typography.bodyMedium)
                                Text("Partner Universities: ${metrics.partnerUniversities}", style = MaterialTheme.typography.bodyMedium)
                                Text("Visa Success Rate: ${metrics.visaSuccessRate}%", style = MaterialTheme.typography.bodyMedium)
                                Text("Years in Industry: ${metrics.yearsExperience} Years", style = MaterialTheme.typography.bodyMedium)

                                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                                Text("Database Backend: Supabase PostgreSQL (schema.sql)", style = MaterialTheme.typography.bodySmall.copy(color = AccentCyan, fontWeight = FontWeight.Bold))
                                Text("Row Level Security: Enabled on 18 tables", style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary))
                                Text("Office Address: 1st Floor, 239A Civic Center, Gujranwala", style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary))
                            }
                        }
                    }
                }
            }
        }
    }

    // UPDATE LEAD STAGE DIALOG
    if (editingLead != null) {
        val lead = editingLead!!
        var chosenStatus by remember { mutableStateOf(lead.status) }

        AlertDialog(
            onDismissRequest = { editingLead = null },
            title = { Text("Update Pipeline Stage", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Student: ${lead.fullName} (${lead.destination})")

                    Text("Select Stage:", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))

                    LeadStatus.values().forEach { st ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { chosenStatus = st }
                        ) {
                            RadioButton(selected = chosenStatus == st, onClick = { chosenStatus = st })
                            Text(st.label, style = MaterialTheme.typography.bodyMedium)
                        }
                    }

                    OutlinedTextField(
                        value = newLeadNote,
                        onValueChange = { newLeadNote = it },
                        label = { Text("Counselor Note / Next Action") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateLeadStatus(lead.id, chosenStatus, newLeadNote)
                        editingLead = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AmberGold, contentColor = NavyDeep)
                ) {
                    Text("Save Changes", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { editingLead = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // CSV EXPORT DIALOG
    if (showCsvDialog) {
        AlertDialog(
            onDismissRequest = { showCsvDialog = false },
            title = { Text("Exported Leads (CSV)", fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text(
                        text = "Data ready for import into CRM or spreadsheet software:",
                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = SlateBackground,
                        modifier = Modifier.fillMaxWidth().heightIn(max = 240.dp)
                    ) {
                        Text(
                            text = csvContent,
                            style = MaterialTheme.typography.bodySmall.copy(fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace, fontSize = 10.sp),
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { showCsvDialog = false },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = NavyDark,
                        contentColor = Color.White
                    )
                ) {
                    Text("Done", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}

@Composable
fun KpiCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = value, style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold, color = NavyDark))
            Text(text = title, style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary, fontSize = 10.sp), maxLines = 1)
        }
    }
}

@Composable
fun LeadStatusBadge(status: LeadStatus) {
    val (bgColor, textColor) = when (status) {
        LeadStatus.NEW -> AccentCyanLight to AccentCyan
        LeadStatus.CONTACTED -> AmberPale to AmberGold
        LeadStatus.IN_PROGRESS -> Color(0xFFE0E7FF) to Color(0xFF4338CA)
        LeadStatus.CONVERTED -> SuccessGreen.copy(alpha = 0.15f) to SuccessGreen
        LeadStatus.CLOSED -> Color(0xFFF1F5F9) to Color(0xFF64748B)
    }

    Surface(
        shape = RoundedCornerShape(6.dp),
        color = bgColor
    ) {
        Text(
            text = status.label.uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(
                color = textColor,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp
            ),
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

enum class AdminSubTab(val title: String) {
    LEADS("Leads CRM"),
    APPOINTMENTS("Appointments"),
    SETTINGS("System & Export")
}
