package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel

@Composable
fun ContactScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
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
                title = "Contact SR Global",
                subtitle = "Visit our central Gujranwala office or connect directly with our Australian branch for migration inquiries.",
                badgeText = "Get In Touch"
            )
        }

        // Office Location Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(3.dp),
                modifier = Modifier.fillMaxWidth().testTag("contact_office_card")
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(AmberPale),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Default.Place, contentDescription = null, tint = AmberGold)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Pakistan Head Office",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                            )
                            Text(
                                text = "Civic Center, Gujranwala",
                                style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = contact.address,
                        style = MaterialTheme.typography.bodyMedium.copy(color = SlateTextPrimary, lineHeight = 20.sp)
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "GPS Coordinates: ${contact.latitude}, ${contact.longitude}",
                        style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            launchGoogleMaps(context, contact.latitude, contact.longitude, "SR Global Consultants Gujranwala")
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NavyDark,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .minimumInteractiveComponentSize()
                            .testTag("navigate_google_maps_button")
                    ) {
                        Icon(imageVector = Icons.Default.Directions, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Get Driving Directions in Google Maps", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Direct Communication Channels
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Direct Helplines & Support",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    ContactActionRow(
                        icon = Icons.Default.Phone,
                        iconTint = SuccessGreen,
                        title = "Pakistan Office Helpline",
                        subtitle = contact.phonePakistan,
                        actionLabel = "Call",
                        onClick = { launchPhoneCall(context, contact.phonePakistan) }
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                    ContactActionRow(
                        icon = Icons.Default.PhoneIphone,
                        iconTint = AccentCyan,
                        title = "Australia Liaison Phone",
                        subtitle = contact.phoneAustralia,
                        actionLabel = "Call AU",
                        onClick = { launchPhoneCall(context, contact.phoneAustralia) }
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                    ContactActionRow(
                        icon = Icons.Default.Chat,
                        iconTint = WhatsAppGreen,
                        title = "Official WhatsApp Desk",
                        subtitle = "+92 327 8321560 (Instant Chat)",
                        actionLabel = "Chat",
                        onClick = {
                            launchWhatsApp(
                                context,
                                contact.whatsappNumber,
                                "Hello SR Global Consultants! I am reaching out through the app for counseling information."
                            )
                        }
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                    ContactActionRow(
                        icon = Icons.Default.Email,
                        iconTint = AmberGold,
                        title = "Official Admissions Email",
                        subtitle = contact.email,
                        actionLabel = "Email",
                        onClick = { launchEmail(context, contact.email, "Admissions & Visa Inquiry - SR Global") }
                    )
                }
            }
        }

        // Office Timings & Social
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Office Hours & Official Channels",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.AccessTime, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = contact.officeHours,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Follow us on social networks for visa approval updates and university delegation visits:",
                        style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        SocialChip(name = "Facebook", url = contact.facebook, context = context, modifier = Modifier.weight(1f))
                        SocialChip(name = "X / Twitter", url = contact.twitter, context = context, modifier = Modifier.weight(1f))
                        SocialChip(name = "LinkedIn", url = contact.linkedin, context = context, modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
fun ContactActionRow(
    icon: ImageVector,
    iconTint: Color,
    title: String,
    subtitle: String,
    actionLabel: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(iconTint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = title, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = NavyDark))
                Text(text = subtitle, style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary))
            }
        }

        OutlinedButton(
            onClick = onClick,
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = AegeanCyanLight,
                contentColor = NavyDark
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, AegeanCyan),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.minimumInteractiveComponentSize()
        ) {
            Text(actionLabel, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NavyDark)
        }
    }
}

@Composable
fun SocialChip(name: String, url: String, context: android.content.Context, modifier: Modifier = Modifier) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = SlateBackground,
        border = ButtonDefaults.outlinedButtonBorder.copy(
            brush = androidx.compose.ui.graphics.SolidColor(SlateBorder)
        ),
        modifier = modifier
            .clickable {
                try {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (e: Exception) {
                    // ignore
                }
            }
    ) {
        Text(
            text = name,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.SemiBold,
                color = NavyDark,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            ),
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
}
