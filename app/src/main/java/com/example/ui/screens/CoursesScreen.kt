package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Course
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.MainViewModel
import com.example.ui.viewmodel.NavTab

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CoursesScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val categories by viewModel.categories.collectAsState()
    val courses by viewModel.filteredCourses.collectAsState()
    val selectedCategory by viewModel.selectedCategorySlug.collectAsState()
    val searchQuery by viewModel.courseSearchQuery.collectAsState()

    var activeCourseDetail by remember { mutableStateOf<Course?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SlateBackground),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            SectionHeader(
                title = "Courses & Training Programs",
                subtitle = "Browse accredited vocational diplomas, trade courses, and university degrees.",
                badgeText = "Course Directory"
            )
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.setCourseSearchQuery(it) },
                placeholder = { Text("Search by course title, country, or skill...") },
                leadingIcon = {
                    Icon(imageVector = Icons.Default.Search, contentDescription = "Search", tint = SlateTextSecondary)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.setCourseSearchQuery("") }) {
                            Icon(imageVector = Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = AmberGold,
                    unfocusedBorderColor = SlateBorder
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("course_search_input")
            )
        }

        // Category Filter Chips
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = selectedCategory == "all" || selectedCategory == null,
                        onClick = { viewModel.selectCategoryFilter("all") },
                        label = { Text("All Courses") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NavyDark,
                            selectedLabelColor = Color.White
                        ),
                        modifier = Modifier.testTag("filter_all")
                    )
                }

                items(categories) { cat ->
                    val isSelected = selectedCategory == cat.slug
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.selectCategoryFilter(cat.slug) },
                        label = { Text(cat.name) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NavyDark,
                            selectedLabelColor = Color.White
                        ),
                        modifier = Modifier.testTag("filter_${cat.slug}")
                    )
                }
            }
        }

        // Results Count
        item {
            Text(
                text = "Showing ${courses.size} accredited programs",
                style = MaterialTheme.typography.labelMedium.copy(
                    color = SlateTextSecondary,
                    fontWeight = FontWeight.SemiBold
                )
            )
        }

        // Course List
        if (courses.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(imageVector = Icons.Default.SearchOff, contentDescription = null, tint = SlateTextSecondary, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No matching courses found",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = NavyDark)
                        )
                        Text(
                            text = "Try clearing search filters or choosing a different category.",
                            style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        } else {
            items(courses) { course ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { activeCourseDetail = course }
                        .testTag("course_item_${course.id}")
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Text(
                                text = course.title,
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = NavyDark
                                ),
                                modifier = Modifier.weight(1f)
                            )
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = AccentCyanLight,
                                modifier = Modifier.padding(start = 8.dp)
                            ) {
                                Text(
                                    text = course.country,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = AccentCyan,
                                        fontWeight = FontWeight.Bold
                                    ),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = course.description,
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = SlateTextPrimary,
                                lineHeight = 18.sp
                            ),
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Duration & Intakes", style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary, fontSize = 10.sp))
                                Text("${course.duration} • ${course.intakeMonths}", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium))
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Estimated Tuition", style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary, fontSize = 10.sp))
                                Text(course.estimatedFees, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = AmberGold))
                            }
                        }

                        HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Path: ${course.careerPaths.take(28)}...",
                                style = MaterialTheme.typography.bodySmall.copy(color = SlateTextSecondary, fontSize = 11.sp),
                                modifier = Modifier.weight(1f)
                            )

                            Button(
                                onClick = { activeCourseDetail = course },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = NavyDark,
                                    contentColor = Color.White
                                ),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.minimumInteractiveComponentSize()
                            ) {
                                Text("View & Inquire", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }

    // COURSE DETAIL SHEET
    if (activeCourseDetail != null) {
        val course = activeCourseDetail!!
        ModalBottomSheet(
            onDismissRequest = { activeCourseDetail = null },
            containerColor = Color.White,
            shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = AmberPale
                ) {
                    Text(
                        text = course.country.uppercase(),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = AmberGold,
                            fontWeight = FontWeight.Bold
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = course.title,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )
                )

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = SlateBackground),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("Duration", style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary))
                                Text(course.duration, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold))
                            }
                        }
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = SlateBackground),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("Tuition Range", style = MaterialTheme.typography.labelSmall.copy(color = SlateTextSecondary))
                                Text(course.estimatedFees, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = AmberGold))
                            }
                        }
                    }

                    Text("Program Description", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = NavyDark))
                    Text(course.description, style = MaterialTheme.typography.bodySmall.copy(color = SlateTextPrimary, lineHeight = 20.sp))

                    Text("Target Career Pathways & Migration Outcomes", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = NavyDark))
                    Text(course.careerPaths, style = MaterialTheme.typography.bodySmall.copy(color = SlateTextPrimary))

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            activeCourseDetail = null
                            viewModel.setTab(NavTab.APPOINTMENT)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AmberGold, contentColor = NavyDeep),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .minimumInteractiveComponentSize()
                    ) {
                        Icon(imageVector = Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Apply / Book Counseling for this Course", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
