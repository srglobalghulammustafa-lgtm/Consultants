package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.model.Destination
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel
import com.example.ui.viewmodel.NavTab

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DestinationsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val destinations by viewModel.destinations.collectAsState()
    val selectedDestination by viewModel.selectedDestination.collectAsState()

    var showDetailSheet by remember { mutableStateOf(false) }
    var activeDetail by remember { mutableStateOf<Destination?>(null) }

    LaunchedEffect(selectedDestination) {
        if (selectedDestination != null) {
            activeDetail = selectedDestination
            showDetailSheet = true
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateBackground),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            SectionHeader(
                title = "Study Destinations",
                subtitle = "Explore top international education hubs with accredited post-study work visas and permanent residency pathways.",
                badgeText = "Global Mobility"
            )
        }

        items(destinations) { dest ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(3.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        activeDetail = dest
                        showDetailSheet = true
                    }
                    .testTag("destination_item_${dest.slug}")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = dest.flagEmoji, fontSize = 32.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = dest.countryName,
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = NavyDark
                                    )
                                )
                                Text(
                                    text = "Capital: ${dest.capital} • ${dest.currency}",
                                    style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary)
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AmberPale
                        ) {
                            Text(
                                text = dest.visaSubclass,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = AmberGold
                                ),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = dest.overview,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = SlateTextPrimary,
                            lineHeight = 20.sp
                        ),
                        maxLines = 3
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.WorkOutline,
                                contentDescription = null,
                                tint = AccentCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = dest.workRights.take(30) + "...",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = SlateTextSecondary,
                                    fontSize = 11.sp
                                )
                            )
                        }

                        TextButton(
                            onClick = {
                                activeDetail = dest
                                showDetailSheet = true
                            }
                        ) {
                            Text(
                                text = "View Details",
                                fontWeight = FontWeight.Bold,
                                color = AccentCyan
                            )
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = AccentCyan
                            )
                        }
                    }
                }
            }
        }
    }

    // DETAIL MODAL SHEET
    if (showDetailSheet && activeDetail != null) {
        val detail = activeDetail!!
        ModalBottomSheet(
            onDismissRequest = {
                showDetailSheet = false
                viewModel.selectDestination(null)
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = detail.flagEmoji, fontSize = 36.sp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = detail.countryName,
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = NavyDark
                                )
                            )
                            Text(
                                text = detail.visaSubclass,
                                style = MaterialTheme.typography.bodySmall.copy(color = AmberGold, fontWeight = FontWeight.SemiBold)
                            )
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                LazyColumn(
                    modifier = Modifier.heightIn(max = 480.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        DetailSection("Country Overview", detail.overview)
                    }

                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Card(
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = AccentCyanLight),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("Avg Living Cost", style = MaterialTheme.typography.labelSmall.copy(color = AccentCyan, fontWeight = FontWeight.Bold))
                                    Text(detail.avgLivingCost, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium))
                                }
                            }
                            Card(
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = AmberPale),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("Work Rights", style = MaterialTheme.typography.labelSmall.copy(color = AmberGold, fontWeight = FontWeight.Bold))
                                    Text(detail.workRights, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium), maxLines = 2)
                                }
                            }
                        }
                    }

                    item {
                        DetailSection("Visa Application Process", detail.visaProcess)
                    }

                    item {
                        DetailSection("Admission Requirements", detail.admissionRequirements)
                    }

                    item {
                        Column {
                            Text(
                                text = "Top Universities & Colleges",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            detail.topUniversities.forEach { uni ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(vertical = 3.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.School, contentDescription = null, tint = AmberGold, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(text = uni, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }

                    item {
                        Button(
                            onClick = {
                                showDetailSheet = false
                                viewModel.selectDestination(null)
                                viewModel.setTab(NavTab.APPOINTMENT)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = AmberGold, contentColor = NavyDeep),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                                .minimumInteractiveComponentSize()
                        ) {
                            Icon(imageVector = Icons.Default.Event, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Book Counseling for ${detail.countryName}", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DetailSection(title: String, text: String) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall.copy(
                fontWeight = FontWeight.Bold,
                color = NavyDark
            )
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall.copy(
                color = SlateTextPrimary,
                lineHeight = 18.sp
            )
        )
    }
}
