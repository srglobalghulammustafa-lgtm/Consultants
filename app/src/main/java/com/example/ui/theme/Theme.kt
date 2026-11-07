package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = AegeanCyan,
    onPrimary = NavyDeep,
    primaryContainer = DarkSurfaceCard,
    onPrimaryContainer = AegeanCyanLight,
    secondary = AmberGold,
    onSecondary = NavyDeep,
    secondaryContainer = NavyCard,
    onSecondaryContainer = AmberPale,
    tertiary = WhatsAppGreen,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceCard,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorder
)

private val LightColorScheme = lightColorScheme(
    primary = AegeanCyan,
    onPrimary = Color.White,
    primaryContainer = AegeanCyanLight,
    onPrimaryContainer = AegeanCyanDeep,
    secondary = NavyDark,
    onSecondary = Color.White,
    secondaryContainer = AegeanCyanPale,
    onSecondaryContainer = NavyDark,
    tertiary = WhatsAppGreen,
    background = SlateBackground,
    onBackground = SlateTextPrimary,
    surface = SlateSurface,
    onSurface = SlateTextPrimary,
    surfaceVariant = SlateBackground,
    onSurfaceVariant = SlateTextSecondary,
    outline = SlateBorder
)

@Composable
fun SRGlobalTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Preserve official Aegean Cyan brand colors
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    SRGlobalTheme(darkTheme = darkTheme, dynamicColor = dynamicColor, content = content)
}
