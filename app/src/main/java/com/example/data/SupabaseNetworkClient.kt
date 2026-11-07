package com.example.data

import android.util.Log
import com.example.model.Appointment
import com.example.model.Lead
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class SupabaseNetworkClient(
    val supabaseUrl: String = "https://lqggahnqfbihbnydpfre.supabase.co",
    val supabaseKey: String = "sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(6, TimeUnit.SECONDS)
        .readTimeout(6, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun syncLeadToSupabase(lead: Lead): Boolean = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("full_name", lead.fullName)
                put("email", lead.email)
                put("phone", lead.phone)
                put("destination", lead.destination)
                put("course_interest", lead.courseInterest)
                put("status", lead.status.label)
                put("source", lead.source)
                put("notes", lead.notes)
            }

            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/leads")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .post(json.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val success = response.isSuccessful
            response.close()
            Log.d("SupabaseSync", "Lead sync status: $success")
            success
        } catch (e: Exception) {
            Log.w("SupabaseSync", "Live Supabase sync notice: ${e.message}")
            false
        }
    }

    suspend fun syncAppointmentToSupabase(appointment: Appointment): Boolean = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("client_name", appointment.clientName)
                put("email", appointment.email)
                put("phone", appointment.phone)
                put("destination", appointment.destination)
                put("appointment_date", appointment.date)
                put("time_slot", appointment.timeSlot)
                put("mode", if (appointment.mode.name == "OFFICE") "Office" else "Online")
                put("status", appointment.status.label)
                put("message", appointment.message)
            }

            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/appointments")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=minimal")
                .post(json.toString().toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val success = response.isSuccessful
            response.close()
            Log.d("SupabaseSync", "Appointment sync status: $success")
            success
        } catch (e: Exception) {
            Log.w("SupabaseSync", "Live Supabase sync notice: ${e.message}")
            false
        }
    }
}
