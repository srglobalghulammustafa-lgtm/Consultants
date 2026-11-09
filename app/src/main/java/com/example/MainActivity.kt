package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.components.FloatingWhatsAppButton
import com.example.ui.components.SRGlobalBottomNav
import com.example.ui.components.SRGlobalTopBar
import com.example.ui.screens.*
import com.example.ui.theme.AmberGold
import com.example.ui.theme.NavyDeep
import com.example.ui.theme.SRGlobalTheme
import com.example.ui.viewmodel.MainViewModel
import com.example.ui.viewmodel.NavTab

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SRGlobalTheme {
                val viewModel: MainViewModel = viewModel()
                val currentTab by viewModel.currentTab.collectAsState()
                val isAdminMode by viewModel.isAdminMode.collectAsState()
                val contact by viewModel.contact.collectAsState()

                var showPinDialog by remember { mutableStateOf(false) }
                var enteredPin by remember { mutableStateOf("") }
                var pinError by remember { mutableStateOf(false) }
                var isSplashShowing by remember { mutableStateOf(true) }

                val notifPermissionLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
                    contract = androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
                ) { /* Result handled */ }

                LaunchedEffect(Unit) {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                        notifPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                if (isSplashShowing) {
                    SplashScreen(onSplashFinished = { isSplashShowing = false })
                } else {
                    // Android BackHandler: gracefully pops admin mode or returns to Home tab
                    BackHandler(enabled = isAdminMode || currentTab != NavTab.HOME) {
                        if (isAdminMode) {
                            viewModel.toggleAdminMode(false)
                        } else if (currentTab != NavTab.HOME) {
                            viewModel.setTab(NavTab.HOME)
                        }
                    }

                    Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        if (!isAdminMode) {
                            SRGlobalTopBar(
                                isAdminMode = false,
                                onAdminToggleClick = {
                                    enteredPin = ""
                                    pinError = false
                                    showPinDialog = true
                                },
                                officePhone = contact.phonePakistan
                            )
                        }
                    },
                    bottomBar = {
                        if (!isAdminMode) {
                            SRGlobalBottomNav(
                                currentTab = currentTab,
                                onTabSelected = { viewModel.setTab(it) }
                            )
                        }
                    },
                    floatingActionButton = {
                        if (!isAdminMode && currentTab != NavTab.APPOINTMENT) {
                            FloatingWhatsAppButton(
                                phoneNumber = contact.whatsappNumber
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(
                                top = if (isAdminMode) 0.dp else innerPadding.calculateTopPadding(),
                                bottom = if (isAdminMode) 0.dp else innerPadding.calculateBottomPadding()
                            )
                    ) {
                        if (isAdminMode) {
                            AdminDashboardScreen(
                                viewModel = viewModel,
                                onExitAdmin = { viewModel.toggleAdminMode(false) }
                            )
                        } else {
                            when (currentTab) {
                                NavTab.HOME -> HomeScreen(viewModel = viewModel)
                                NavTab.DESTINATIONS -> DestinationsScreen(viewModel = viewModel)
                                NavTab.COURSES -> CoursesScreen(viewModel = viewModel)
                                NavTab.APPOINTMENT -> AppointmentScreen(viewModel = viewModel)
                                NavTab.STUDENT_PORTAL -> StudentWorkspaceScreen(viewModel = viewModel)
                                NavTab.CONTACT -> ContactScreen(viewModel = viewModel)
                            }
                        }
                    }
                }

                // ADMIN PIN MODAL
                if (showPinDialog) {
                    AlertDialog(
                        onDismissRequest = { showPinDialog = false },
                        title = {
                            Text(
                                text = "Consultant Admin Verification",
                                fontWeight = FontWeight.Bold
                            )
                        },
                        text = {
                            Column {
                                Text(
                                    text = "Enter the 4-digit staff PIN to access the CRM leads pipeline and appointment schedule (Default: 1234).",
                                    style = MaterialTheme.typography.bodySmall
                                )
                                Spacer(modifier = Modifier.height(14.dp))
                                OutlinedTextField(
                                    value = enteredPin,
                                    onValueChange = {
                                        if (it.length <= 4) enteredPin = it
                                        pinError = false
                                    },
                                    label = { Text("Staff PIN") },
                                    visualTransformation = PasswordVisualTransformation(),
                                    isError = pinError,
                                    supportingText = {
                                        if (pinError) {
                                            Text("Incorrect PIN. Please use '1234'.", color = MaterialTheme.colorScheme.error)
                                        }
                                    },
                                    singleLine = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("admin_pin_input")
                                )
                            }
                        },
                        confirmButton = {
                            Button(
                                onClick = {
                                    if (viewModel.repository.verifyAdminPin(enteredPin)) {
                                        showPinDialog = false
                                        viewModel.toggleAdminMode(true)
                                    } else {
                                        pinError = true
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = AmberGold,
                                    contentColor = NavyDeep
                                ),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.testTag("submit_pin_button")
                            ) {
                                Text("Enter Admin Mode", fontWeight = FontWeight.Bold)
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showPinDialog = false }) {
                                Text("Cancel")
                            }
                        }
                    )
                }
                }
            }
        }
    }
}
