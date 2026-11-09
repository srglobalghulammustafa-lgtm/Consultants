package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.NavTab

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SRGlobalTopBar(
    isAdminMode: Boolean,
    onAdminToggleClick: () -> Unit,
    modifier: Modifier = Modifier,
    officePhone: String = "+923278321560"
) {
    val context = LocalContext.current
    var tapCount by remember { mutableIntStateOf(0) }
    var lastTapTime by remember { mutableLongStateOf(0L) }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .shadow(elevation = 8.dp)
    ) {
        Surface(
            color = NavyDeep,
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF071426),
                                Color(0xFF0A2242),
                                Color(0xFF0D2D56)
                            )
                        )
                    )
                    .statusBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Left: Logo & Branding with 5-tap secret staff trigger
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable {
                                val now = System.currentTimeMillis()
                                if (now - lastTapTime < 2000) {
                                    tapCount++
                                } else {
                                    tapCount = 1
                                }
                                lastTapTime = now
                                if (tapCount >= 5) {
                                    tapCount = 0
                                    onAdminToggleClick()
                                }
                            }
                            .padding(vertical = 4.dp, horizontal = 2.dp)
                    ) {
                        // Official Emblem with Gold and Cyan double ring
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(48.dp)
                                .shadow(elevation = 4.dp, shape = CircleShape)
                                .background(
                                    Brush.sweepGradient(
                                        listOf(
                                            AmberGold,
                                            AegeanCyan,
                                            AmberLight,
                                            AegeanCyan,
                                            AmberGold
                                        )
                                    ),
                                    shape = CircleShape
                                )
                                .padding(2.dp)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = Color.White,
                                modifier = Modifier.fillMaxSize()
                            ) {
                                androidx.compose.foundation.Image(
                                    painter = androidx.compose.ui.res.painterResource(id = com.example.R.drawable.sr_global_icon),
                                    contentDescription = "SR Global Official Logo",
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .clip(CircleShape)
                                        .padding(2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "SR GLOBAL",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Black,
                                        letterSpacing = 1.2.sp,
                                        color = Color.White,
                                        fontSize = 17.sp
                                    )
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = AegeanCyan,
                                    shadowElevation = 2.dp
                                ) {
                                    Text(
                                        text = "CONSULTANTS",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 8.5.sp,
                                            letterSpacing = 0.6.sp,
                                            color = Color.White
                                        ),
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Filled.Verified,
                                    contentDescription = "Verified Firm",
                                    tint = AmberGold,
                                    modifier = Modifier.size(12.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Gujranwala • Melbourne • Global Visa",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = Color.White.copy(alpha = 0.85f),
                                        fontSize = 10.5.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Right: Quick Action Controls (Helpline Dial + Staff Portal)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Quick Phone Call button
                        IconButton(
                            onClick = { launchPhoneCall(context, officePhone) },
                            modifier = Modifier
                                .size(42.dp)
                                .shadow(2.dp, CircleShape)
                                .background(Color(0xFF0F3B20), CircleShape)
                                .padding(1.dp)
                                .testTag("header_call_button")
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Phone,
                                contentDescription = "Call Gujranwala Head Office",
                                tint = Color(0xFF4ADE80),
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        // Staff Portal Access Button (Explicit + Accessible)
                        IconButton(
                            onClick = onAdminToggleClick,
                            modifier = Modifier
                                .size(42.dp)
                                .shadow(2.dp, CircleShape)
                                .background(
                                    if (isAdminMode) AmberGold else Color(0xFF1E3A5F),
                                    CircleShape
                                )
                                .padding(1.dp)
                                .testTag("header_admin_portal_button")
                        ) {
                            Icon(
                                imageVector = if (isAdminMode) Icons.Filled.AdminPanelSettings else Icons.Filled.Lock,
                                contentDescription = "Staff Admin Portal Access",
                                tint = if (isAdminMode) NavyDeep else Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }

        // Sleek Aegean Cyan to Amber Gold accent border line
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(2.5.dp)
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            AegeanCyan,
                            AmberGold,
                            AegeanCyan
                        )
                    )
                )
        )
    }
}

@Composable
fun SRGlobalBottomNav(
    currentTab: NavTab,
    onTabSelected: (NavTab) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        containerColor = NavyDark,
        tonalElevation = 8.dp,
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
    ) {
        val items = listOf(
            Triple(NavTab.HOME, Icons.Filled.Home, Icons.Outlined.Home),
            Triple(NavTab.DESTINATIONS, Icons.Filled.FlightTakeoff, Icons.Outlined.FlightTakeoff),
            Triple(NavTab.COURSES, Icons.Filled.School, Icons.Outlined.School),
            Triple(NavTab.APPOINTMENT, Icons.Filled.EventAvailable, Icons.Outlined.EventAvailable),
            Triple(NavTab.STUDENT_PORTAL, Icons.Filled.AssignmentTurnedIn, Icons.Outlined.AssignmentTurnedIn),
            Triple(NavTab.CONTACT, Icons.Filled.LocationOn, Icons.Outlined.LocationOn)
        )

        items.forEach { (tab, selectedIcon, unselectedIcon) ->
            val isSelected = currentTab == tab
            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(tab) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) selectedIcon else unselectedIcon,
                        contentDescription = tab.title,
                        modifier = Modifier.size(22.dp)
                    )
                },
                label = {
                    Text(
                        text = tab.title,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 10.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = NavyDeep,
                    selectedTextColor = AmberLight,
                    indicatorColor = AmberGold,
                    unselectedIconColor = Color.White.copy(alpha = 0.6f),
                    unselectedTextColor = Color.White.copy(alpha = 0.6f)
                ),
                modifier = Modifier.testTag("nav_item_${tab.name.lowercase()}")
            )
        }
    }
}

@Composable
fun FloatingWhatsAppButton(
    phoneNumber: String = "923278321560",
    message: String = "Hello SR Global Consultants! I am inquiring about international study options and visa guidance.",
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    FloatingActionButton(
        onClick = {
            launchWhatsApp(context, phoneNumber, message)
        },
        containerColor = WhatsAppGreen,
        contentColor = Color.White,
        shape = CircleShape,
        elevation = FloatingActionButtonDefaults.elevation(8.dp),
        modifier = modifier
            .scale(scale)
            .shadow(12.dp, CircleShape)
            .minimumInteractiveComponentSize()
            .testTag("floating_whatsapp_button")
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = "Chat on WhatsApp",
                tint = Color.White,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "WhatsApp",
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            )
        }
    }
}

fun launchWhatsApp(context: Context, phone: String, message: String) {
    try {
        val cleanPhone = phone.replace("+", "").replace(" ", "").replace("-", "")
        val uri = Uri.parse("https://api.whatsapp.com/send?phone=$cleanPhone&text=${Uri.encode(message)}")
        val intent = Intent(Intent.ACTION_VIEW, uri)
        context.startActivity(intent)
    } catch (e: Exception) {
        val browserUri = Uri.parse("https://wa.me/$phone")
        context.startActivity(Intent(Intent.ACTION_VIEW, browserUri))
    }
}

fun launchPhoneCall(context: Context, phone: String) {
    try {
        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))
        context.startActivity(intent)
    } catch (e: Exception) {
        // fallback
    }
}

fun launchEmail(context: Context, email: String, subject: String) {
    try {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:$email")
            putExtra(Intent.EXTRA_SUBJECT, subject)
        }
        context.startActivity(intent)
    } catch (e: Exception) {
        // fallback
    }
}

fun launchGoogleMaps(context: Context, lat: Double, lng: Double, label: String) {
    try {
        val uri = Uri.parse("geo:$lat,$lng?q=$lat,$lng(${Uri.encode(label)})")
        val mapIntent = Intent(Intent.ACTION_VIEW, uri)
        context.startActivity(mapIntent)
    } catch (e: Exception) {
        val browserUri = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng")
        context.startActivity(Intent(Intent.ACTION_VIEW, browserUri))
    }
}

@Composable
fun SectionHeader(
    title: String,
    subtitle: String? = null,
    badgeText: String? = null,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        if (badgeText != null) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = AmberPale,
                modifier = Modifier.padding(bottom = 6.dp)
            ) {
                Text(
                    text = badgeText.uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = AmberGold,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    ),
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold,
                color = NavyDark
            )
        )
        if (subtitle != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = SlateTextSecondary,
                    lineHeight = 20.sp
                )
            )
        }
    }
}
