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

    val destinations by viewModel.destinations.collectAsState()
    val bannerSlides by viewModel.bannerSlides.collectAsState()
    val testimonials by viewModel.testimonials.collectAsState()

    var activeAdminTab by remember { mutableStateOf(AdminSubTab.LEADS) }
    var showCsvDialog by remember { mutableStateOf(false) }
    var csvContent by remember { mutableStateOf("") }

    var editingLead by remember { mutableStateOf<Lead?>(null) }
    var editingBanner by remember { mutableStateOf<Banner?>(null) }
    var editingDestination by remember { mutableStateOf<Destination?>(null) }
    var editingTestimonial by remember { mutableStateOf<Testimonial?>(null) }

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
                                text = "SR GLOBAL ADMIN",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = AmberLight,
                                    letterSpacing = 1.sp
                                )
                            )
                            Text(
                                text = "Staff Command Center",
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
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(imageVector = Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Export", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Admin Sub Tabs
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(AdminSubTab.values()) { tab ->
                        val isSelected = activeAdminTab == tab
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) AmberGold else Color.White.copy(alpha = 0.1f),
                            modifier = Modifier
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
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
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
            when (activeAdminTab) {
                AdminSubTab.LEADS -> {
                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            KpiCard("Total Leads", "${leads.size}", Icons.Default.PersonSearch, AccentCyan, Modifier.weight(1f))
                            KpiCard("New Today", "${leads.count { it.createdAt.contains("Today") }}", Icons.Default.NewReleases, AmberGold, Modifier.weight(1f))
                        }
                    }
                    items(leads) { lead ->
                        LeadAdminCard(lead, onUpdate = { editingLead = it })
                    }
                }

                AdminSubTab.APPOINTMENTS -> {
                    items(appointments) { appt ->
                        AppointmentAdminCard(appt, onAction = { id, status -> viewModel.updateAppointmentStatus(id, status) })
                    }
                }

                AdminSubTab.BANNERS -> {
                    item {
                        Button(
                            onClick = { editingBanner = Banner(title = "", description = "", imageUrl = "") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                        ) {
                            Icon(Icons.Default.Add, null)
                            Text("Add New Homepage Banner")
                        }
                    }
                    items(bannerSlides) { slide ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(slide.title, fontWeight = FontWeight.Bold)
                                    Text(slide.subtitle, style = MaterialTheme.typography.bodySmall, maxLines = 1)
                                }
                                IconButton(onClick = { 
                                    editingBanner = Banner(id = slide.id, title = slide.title, description = slide.subtitle, imageUrl = slide.bgImage ?: "")
                                }) {
                                    Icon(Icons.Default.Edit, null, tint = AccentCyan)
                                }
                                IconButton(onClick = { viewModel.deleteBanner(slide.id) }) {
                                    Icon(Icons.Default.Delete, null, tint = ErrorRed)
                                }
                            }
                        }
                    }
                }

                AdminSubTab.CONTENT -> {
                    item { Text("Study Destinations", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold) }
                    item {
                        Button(
                            onClick = { editingDestination = Destination(countryName = "", slug = "", capital = "", currency = "", avgLivingCost = "", workRights = "", visaSubclass = "", overview = "", visaProcess = "", admissionRequirements = "", topUniversities = emptyList(), flagEmoji = "🌍") },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Add New Destination")
                        }
                    }
                    items(destinations) { dest ->
                        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text(dest.flagEmoji, fontSize = 24.sp)
                                Spacer(Modifier.width(12.dp))
                                Text(dest.countryName, modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
                                IconButton(onClick = { editingDestination = dest }) { Icon(Icons.Default.Edit, null) }
                                IconButton(onClick = { dest.id?.let { viewModel.deleteDestinationRemote(it) } }) { Icon(Icons.Default.Delete, null, tint = ErrorRed) }
                            }
                        }
                    }

                    item { Spacer(Modifier.height(16.dp)) }
                    item { Text("Student Testimonials", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold) }
                    item {
                        Button(
                            onClick = { editingTestimonial = Testimonial(studentName = "", university = "", country = "", quote = "") },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Add Success Story")
                        }
                    }
                    items(testimonials) { t ->
                        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text(t.studentName, modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
                                IconButton(onClick = { editingTestimonial = t }) { Icon(Icons.Default.Edit, null) }
                                IconButton(onClick = { viewModel.deleteTestimonialRemote(t.id) }) { Icon(Icons.Default.Delete, null, tint = ErrorRed) }
                            }
                        }
                    }
                }

                AdminSubTab.SETTINGS -> {
                    item { 
                        var title by remember { mutableStateOf("New Announcement") }
                        var body by remember { mutableStateOf("Visit SR Global for latest intake details.") }
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Broadcast Notification", fontWeight = FontWeight.Bold)
                                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
                                OutlinedTextField(value = body, onValueChange = { body = it }, label = { Text("Message") }, modifier = Modifier.fillMaxWidth())
                                Button(onClick = { viewModel.sendBroadcastNotification(context, title, body) }, modifier = Modifier.fillMaxWidth()) { Text("Send Notification") }
                                if (notificationMsg != null) Text(notificationMsg!!, color = SuccessGreen, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }

    // DIALOGS
    if (editingBanner != null) {
        BannerEditDialog(banner = editingBanner!!, onDismiss = { editingBanner = null }, onSave = { viewModel.saveBanner(it) })
    }
    if (editingDestination != null) {
        DestinationEditDialog(dest = editingDestination!!, onDismiss = { editingDestination = null }, onSave = { viewModel.saveDestination(it) })
    }
    if (editingTestimonial != null) {
        TestimonialEditDialog(t = editingTestimonial!!, onDismiss = { editingTestimonial = null }, onSave = { viewModel.saveTestimonialRemote(it) })
    }
    if (editingLead != null) {
        UpdateLeadDialog(lead = editingLead!!, onDismiss = { editingLead = null }, onUpdate = { id, status, note -> viewModel.updateLeadStatus(id, status, note) })
    }

    if (showCsvDialog) {
        AlertDialog(
            onDismissRequest = { showCsvDialog = false },
            title = { Text("Exported Data") },
            text = { SelectionContainer { Text(csvContent) } },
            confirmButton = { Button(onClick = { showCsvDialog = false }) { Text("Close") } }
        )
    }
}

@Composable
fun SelectionContainer(content: @Composable () -> Unit) {
    androidx.compose.foundation.text.selection.SelectionContainer { content() }
}

@Composable
fun LeadAdminCard(lead: Lead, onUpdate: (Lead) -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.White)) {
        Column(Modifier.padding(14.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(lead.fullName, fontWeight = FontWeight.Bold)
                LeadStatusBadge(lead.status)
            }
            Text("${lead.phone} • ${lead.email}", style = MaterialTheme.typography.bodySmall)
            Text("${lead.destination} • ${lead.courseInterest}", color = AccentCyan, style = MaterialTheme.typography.bodySmall)
            Button(onClick = { onUpdate(lead) }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) { Text("Update Stage") }
        }
    }
}

@Composable
fun AppointmentAdminCard(appt: Appointment, onAction: (String, AppointmentStatus) -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.White)) {
        Column(Modifier.padding(14.dp)) {
            Text(appt.clientName, fontWeight = FontWeight.Bold)
            Text("${appt.date} @ ${appt.timeSlot}", color = AmberGold, style = MaterialTheme.typography.bodySmall)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { onAction(appt.id, AppointmentStatus.COMPLETED) }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)) { Text("Complete") }
                OutlinedButton(onClick = { onAction(appt.id, AppointmentStatus.CANCELLED) }, modifier = Modifier.weight(1f)) { Text("Cancel") }
            }
        }
    }
}

@Composable
fun BannerEditDialog(banner: Banner, onDismiss: () -> Unit, onSave: (Banner) -> Unit) {
    var title by remember { mutableStateOf(banner.title) }
    var desc by remember { mutableStateOf(banner.description) }
    var imgUrl by remember { mutableStateOf(banner.imageUrl) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Banner") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") })
                OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description") })
                OutlinedTextField(value = imgUrl, onValueChange = { imgUrl = it }, label = { Text("Image URL") })
            }
        },
        confirmButton = { Button(onClick = { onSave(banner.copy(title = title, description = desc, imageUrl = imgUrl)); onDismiss() }) { Text("Save") } }
    )
}

@Composable
fun DestinationEditDialog(dest: Destination, onDismiss: () -> Unit, onSave: (Destination) -> Unit) {
    var name by remember { mutableStateOf(dest.countryName) }
    var flag by remember { mutableStateOf(dest.flagEmoji) }
    var imgUrl by remember { mutableStateOf(dest.imageUrl ?: "") }
    val flags = listOf("🇦🇺", "🇬🇧", "🇨🇦", "🇺🇸", "🇪🇺", "🇩🇪", "🇮🇪", "🇳🇿")
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Destination") },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.heightIn(max = 400.dp)) {
                item { OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") }) }
                item {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(flags) { f -> Text(f, fontSize = 24.sp, modifier = Modifier.clickable { flag = f }.border(1.dp, if (flag == f) AmberGold else Color.Transparent).padding(4.dp)) }
                    }
                    OutlinedTextField(value = flag, onValueChange = { flag = it }, label = { Text("Emoji") })
                }
                item { OutlinedTextField(value = imgUrl, onValueChange = { imgUrl = it }, label = { Text("Image URL") }) }
            }
        },
        confirmButton = { Button(onClick = { onSave(dest.copy(countryName = name, flagEmoji = flag, imageUrl = imgUrl, slug = name.lowercase().replace(" ", "-"))); onDismiss() }) { Text("Save") } }
    )
}

@Composable
fun TestimonialEditDialog(t: Testimonial, onDismiss: () -> Unit, onSave: (Testimonial) -> Unit) {
    var name by remember { mutableStateOf(t.studentName) }
    var quote by remember { mutableStateOf(t.quote) }
    var imgUrl by remember { mutableStateOf(t.imageUrl ?: "") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Testimonial") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Student Name") })
                OutlinedTextField(value = imgUrl, onValueChange = { imgUrl = it }, label = { Text("Student Image URL") })
                OutlinedTextField(value = quote, onValueChange = { quote = it }, label = { Text("Quote") }, minLines = 3)
            }
        },
        confirmButton = { Button(onClick = { onSave(t.copy(studentName = name, quote = quote, imageUrl = imgUrl)); onDismiss() }) { Text("Save") } }
    )
}

@Composable
fun UpdateLeadDialog(lead: Lead, onDismiss: () -> Unit, onUpdate: (String, LeadStatus, String) -> Unit) {
    var status by remember { mutableStateOf(lead.status) }
    var note by remember { mutableStateOf("") }
    AlertDialog(onDismissRequest = onDismiss, title = { Text("Update Lead Status") }, text = {
        Column {
            LeadStatus.values().forEach { st -> Row(verticalAlignment = Alignment.CenterVertically) { RadioButton(selected = status == st, onClick = { status = st }); Text(st.label) } }
            OutlinedTextField(value = note, onValueChange = { note = it }, label = { Text("Internal Note") })
        }
    }, confirmButton = { Button(onClick = { onUpdate(lead.id, status, note); onDismiss() }) { Text("Update") } })
}

@Composable
fun KpiCard(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color, modifier: Modifier = Modifier) {
    Card(modifier = modifier, colors = CardDefaults.cardColors(containerColor = Color.White)) {
        Column(Modifier.padding(12.dp)) {
            Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            Text(title, style = MaterialTheme.typography.labelSmall, color = SlateTextSecondary)
        }
    }
}

@Composable
fun LeadStatusBadge(status: LeadStatus) {
    val (bg, txt) = when (status) {
        LeadStatus.NEW -> AccentCyanLight to AccentCyan
        LeadStatus.CONTACTED -> AmberPale to AmberGold
        LeadStatus.IN_PROGRESS -> Color(0xFFE0E7FF) to Color(0xFF4338CA)
        LeadStatus.CONVERTED -> SuccessGreen.copy(alpha = 0.15f) to SuccessGreen
        LeadStatus.CLOSED -> Color(0xFFF1F5F9) to Color(0xFF64748B)
    }
    Surface(shape = RoundedCornerShape(6.dp), color = bg) {
        Text(status.label.uppercase(), style = MaterialTheme.typography.labelSmall, color = txt, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
    }
}

enum class AdminSubTab(val title: String) {
    LEADS("Leads"),
    APPOINTMENTS("Bookings"),
    BANNERS("Banners"),
    CONTENT("Content"),
    SETTINGS("System")
}
