package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.theme.AegeanCyan
import com.example.ui.theme.AegeanCyanDeep
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit,
    modifier: Modifier = Modifier
) {
    var startAnimation by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0.6f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "splash_scale"
    )

    val alpha by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 900, easing = FastOutSlowInEasing),
        label = "splash_alpha"
    )

    val subtitleAlpha by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1100, delayMillis = 400, easing = FastOutSlowInEasing),
        label = "subtitle_alpha"
    )

    // Pulse effect
    val infiniteTransition = rememberInfiniteTransition(label = "halo_pulse")
    val haloScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "halo_scale"
    )

    LaunchedEffect(Unit) {
        startAnimation = true
        delay(2200) // 2.2 seconds smooth display
        onSplashFinished()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(AegeanCyan)
            .testTag("splash_screen"),
        contentAlignment = Alignment.Center
    ) {
        // Glowing halo behind emblem
        Box(
            modifier = Modifier
                .size(240.dp)
                .scale(haloScale)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.12f))
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .padding(24.dp)
                .scale(scale)
                .alpha(alpha)
        ) {
            // Official Monogram Logo Asset
            androidx.compose.material3.Surface(
                shape = CircleShape,
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier.size(160.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.padding(12.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.sr_global_icon),
                        contentDescription = "SR Global Consultants Official Emblem",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Main Brand Title matching physical signage
            Text(
                text = "SR GLOBAL",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White,
                    letterSpacing = 3.sp,
                    fontFamily = FontFamily.Serif
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Flanking subtitle
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.alpha(subtitleAlpha)
            ) {
                Box(
                    modifier = Modifier
                        .width(36.dp)
                        .height(1.5.dp)
                        .background(Color.White.copy(alpha = 0.85f))
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "CONSULTANTS",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        letterSpacing = 3.sp
                    )
                )
                Spacer(modifier = Modifier.width(10.dp))
                Box(
                    modifier = Modifier
                        .width(36.dp)
                        .height(1.5.dp)
                        .background(Color.White.copy(alpha = 0.85f))
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "EDUCATION & MIGRATION • GUJRANWALA & AUSTRALIA",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = Color.White.copy(alpha = 0.8f),
                    letterSpacing = 1.2.sp,
                    fontWeight = FontWeight.SemiBold
                ),
                textAlign = TextAlign.Center,
                modifier = Modifier.alpha(subtitleAlpha)
            )
        }

        // Bottom tagline & version
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
                .alpha(subtitleAlpha)
        ) {
            Text(
                text = "Licensed Education & Visa Counselors",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = Color.White.copy(alpha = 0.75f),
                    letterSpacing = 0.8.sp
                )
            )
        }
    }
}
