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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppointmentMode
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AppointmentScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val selectedDate by viewModel.selectedDate.collectAsState()
    val selectedSlot by viewModel.selectedSlot.collectAsState()
    val availableSlots by viewModel.availableSlotsForSelectedDate.collectAsState()
    val successMessage by viewModel.bookingSuccessMessage.collectAsState()
    val errorMessage by viewModel.bookingErrorMessage.collectAsState()

    var clientName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var destination by remember { mutableStateOf("Australia") }
    var mode by remember { mutableStateOf(AppointmentMode.OFFICE) }
    var message by remember { mutableStateOf("") }

    // Generate upcoming 7 dates for easy selection
    val upcomingDates = remember {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val cal = Calendar.getInstance()
        (0..7).map { offset ->
            val tempCal = cal.clone() as Calendar
            tempCal.add(Calendar.DAY_OF_YEAR, offset)
            val dateStr = sdf.format(tempCal.time)
            val dayName = SimpleDateFormat("EEE, MMM d", Locale.getDefault()).format(tempCal.time)
            dateStr to dayName
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateBackground),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            SectionHeader(
                title = "Book a Consultation",
                subtitle = "Schedule a one-on-one session with our senior counselors. Choose between in-person counseling at our Gujranwala office or an online session.",
                badgeText = "Guaranteed Slots"
            )
        }

        // Success / Error Feedback Alerts
        if (successMessage != null) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SuccessGreen.copy(alpha = 0.12f)),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(SuccessGreen)
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("booking_success_banner")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = successMessage ?: "",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = NavyDark,
                                fontWeight = FontWeight.SemiBold
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { viewModel.clearBookingAlerts() }) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Dismiss", tint = NavyDark)
                        }
                    }
                }
            }
        }

        if (errorMessage != null) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.12f)),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(ErrorRed)
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("booking_error_banner")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Error, contentDescription = null, tint = ErrorRed)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = errorMessage ?: "",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = ErrorRed,
                                fontWeight = FontWeight.Bold
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { viewModel.clearBookingAlerts() }) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Dismiss", tint = ErrorRed)
                        }
                    }
                }
            }
        }

        // STEP 1: DATE PICKER
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(NavyDark),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("1", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Select Appointment Date",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(upcomingDates) { (dateStr, displayStr) ->
                            val isSelected = selectedDate == dateStr
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) NavyDark else SlateBackground,
                                border = if (isSelected) null else ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(SlateBorder)
                                ),
                                modifier = Modifier
                                    .clickable { viewModel.selectAppointmentDate(dateStr) }
                                    .testTag("date_chip_$dateStr")
                            ) {
                                Column(
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = displayStr.substringBefore(","),
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = if (isSelected) AmberGold else SlateTextSecondary,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                    Text(
                                        text = displayStr.substringAfter(", "),
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            color = if (isSelected) Color.White else NavyDark,
                                            fontWeight = FontWeight.ExtraBold
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // STEP 2: TIME SLOTS WITH DOUBLE-BOOKING PREVENTION
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(NavyDark),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("2", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Select Time Slot",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = AccentCyanLight
                        ) {
                            Text(
                                text = "Double-booking Protected",
                                style = MaterialTheme.typography.labelSmall.copy(color = AccentCyan, fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Occupied slots are locked automatically to prevent schedule conflicts.",
                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        availableSlots.forEach { (slot, isAvailable) ->
                            val isSelected = selectedSlot == slot

                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = when {
                                    !isAvailable -> Color(0xFFF1F5F9)
                                    isSelected -> AmberPale
                                    else -> SlateBackground
                                },
                                border = ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(
                                        when {
                                            !isAvailable -> Color.Transparent
                                            isSelected -> AmberGold
                                            else -> SlateBorder
                                        }
                                    )
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable(enabled = isAvailable) {
                                        viewModel.selectAppointmentSlot(slot)
                                    }
                                    .testTag("slot_item_$slot")
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 14.dp, vertical = 12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.AccessTime,
                                            contentDescription = null,
                                            tint = if (isAvailable) (if (isSelected) AmberGold else NavyDark) else Color(0xFF94A3B8),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text(
                                            text = slot,
                                            style = MaterialTheme.typography.bodyMedium.copy(
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = if (isAvailable) (if (isSelected) NavyDark else SlateTextPrimary) else Color(0xFF94A3B8)
                                            )
                                        )
                                    }

                                    if (!isAvailable) {
                                        Surface(
                                            shape = RoundedCornerShape(4.dp),
                                            color = Color(0xFFFFE4E6)
                                        ) {
                                            Text(
                                                text = "ALREADY BOOKED",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    color = ErrorRed,
                                                    fontWeight = FontWeight.ExtraBold,
                                                    fontSize = 9.sp
                                                ),
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    } else if (isSelected) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = "Selected",
                                            tint = AmberGold,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    } else {
                                        Text(
                                            text = "Available",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                color = SuccessGreen,
                                                fontWeight = FontWeight.Bold
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // STEP 3: MODE & DETAILS
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(NavyDark),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("3", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Mode & Contact Information",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text("Consultation Format", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = SlateTextSecondary))
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (mode == AppointmentMode.OFFICE) AmberPale else SlateBackground,
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (mode == AppointmentMode.OFFICE) AmberGold else SlateBorder)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { mode = AppointmentMode.OFFICE }
                                .testTag("mode_office")
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(selected = mode == AppointmentMode.OFFICE, onClick = { mode = AppointmentMode.OFFICE })
                                Text(
                                    text = "Office (Gujranwala)",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold)
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (mode == AppointmentMode.ONLINE) AccentCyanLight else SlateBackground,
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (mode == AppointmentMode.ONLINE) AccentCyan else SlateBorder)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { mode = AppointmentMode.ONLINE }
                                .testTag("mode_online")
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(selected = mode == AppointmentMode.ONLINE, onClick = { mode = AppointmentMode.ONLINE })
                                Text(
                                    text = "Online (Meet/Zoom)",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = clientName,
                        onValueChange = { clientName = it },
                        label = { Text("Your Full Name") },
                        modifier = Modifier.fillMaxWidth().testTag("appointment_name_field")
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("WhatsApp Phone") },
                            modifier = Modifier.weight(1f).testTag("appointment_phone_field")
                        )
                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Email Address") },
                            modifier = Modifier.weight(1f).testTag("appointment_email_field")
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = destination,
                        onValueChange = { destination = it },
                        label = { Text("Target Country (Australia, UK, etc.)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = message,
                        onValueChange = { message = it },
                        label = { Text("Case details or specific questions (optional)") },
                        minLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (clientName.isNotBlank() && phone.isNotBlank()) {
                                viewModel.bookAppointment(
                                    clientName = clientName,
                                    email = email,
                                    phone = phone,
                                    destination = destination,
                                    mode = mode,
                                    message = message
                                )
                                clientName = ""
                                phone = ""
                                email = ""
                                message = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AmberGold, contentColor = NavyDeep),
                        shape = RoundedCornerShape(12.dp),
                        enabled = selectedSlot != null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .minimumInteractiveComponentSize()
                            .testTag("confirm_booking_button")
                    ) {
                        Icon(imageVector = Icons.Default.EventAvailable, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (selectedSlot != null) "Confirm Appointment ($selectedDate)" else "Please Select a Time Slot Above",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
