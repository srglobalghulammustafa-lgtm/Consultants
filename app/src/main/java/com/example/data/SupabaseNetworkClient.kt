package com.example.data

import android.util.Log
import com.example.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class SupabaseNetworkClient {
    private val supabaseUrl = "https://lqggahnqfbihbnydpfre.supabase.co"
    private val supabaseKey = "sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1"
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    suspend fun fetchDestinations(): List<Destination> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/destinations")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            response.close()

            val jsonArray = org.json.JSONArray(body)
            val list = mutableListOf<Destination>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(Destination(
                    id = obj.optString("id"),
                    countryName = obj.getString("country_name"),
                    slug = obj.getString("slug"),
                    capital = obj.optString("capital", ""),
                    currency = obj.optString("currency", ""),
                    avgLivingCost = obj.optString("avg_living_cost", ""),
                    workRights = obj.optString("work_rights", ""),
                    visaSubclass = obj.optString("visa_subclass", ""),
                    overview = obj.optString("overview", ""),
                    visaProcess = obj.optString("visa_process", ""),
                    admissionRequirements = obj.optString("admission_requirements", ""),
                    topUniversities = obj.optString("top_universities", "").split("\n").filter { it.isNotBlank() },
                    flagEmoji = obj.optString("flag", "🌍"),
                    imageUrl = obj.optString("imageUrl", null).takeIf { it != "null" && it.isNotBlank() } ?: obj.optString("imageurl", null).takeIf { it != "null" && it.isNotBlank() }
                ))
            }
            list
        } catch (e: Exception) {
            Log.w("SupabaseFetch", "Destinations fetch notice: ${e.message}")
            emptyList()
        }
    }

    suspend fun fetchTestimonials(): List<Testimonial> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/testimonials?order=created_at.desc")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            response.close()

            val jsonArray = org.json.JSONArray(body)
            val list = mutableListOf<Testimonial>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(Testimonial(
                    id = obj.optString("id"),
                    studentName = obj.getString("student_name"),
                    university = obj.optString("university", ""),
                    country = obj.optString("country", ""),
                    quote = obj.optString("quote", ""),
                    rating = obj.optInt("rating", 5),
                    imageUrl = obj.optString("imageUrl", null).takeIf { it != "null" && it.isNotBlank() } ?: obj.optString("imageurl", null).takeIf { it != "null" && it.isNotBlank() }
                ))
            }
            list
        } catch (e: Exception) {
            Log.w("SupabaseFetch", "Testimonials fetch notice: ${e.message}")
            emptyList()
        }
    }

    suspend fun fetchCourses(): List<Course> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/courses?order=created_at.desc")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            response.close()

            val jsonArray = org.json.JSONArray(body)
            val list = mutableListOf<Course>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(Course(
                    id = obj.optString("id"),
                    title = obj.getString("title"),
                    categorySlug = obj.getString("category_slug"),
                    country = obj.optString("country", ""),
                    duration = obj.optString("duration", ""),
                    estimatedFees = obj.optString("estimated_fees", ""),
                    intakeMonths = obj.optString("intake_months", ""),
                    description = obj.optString("description", ""),
                    careerPaths = obj.optString("career_paths", "")
                ))
            }
            list
        } catch (e: Exception) {
            Log.w("SupabaseFetch", "Courses fetch notice: ${e.message}")
            emptyList()
        }
    }

    suspend fun fetchBanners(): List<Banner> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/banners")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            response.close()

            val jsonArray = org.json.JSONArray(body)
            val list = mutableListOf<Banner>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(Banner(
                    id = obj.optString("id"),
                    title = obj.getString("title"),
                    description = obj.optString("description", ""),
                    imageUrl = (obj.optString("imageUrl", null).takeIf { it != "null" && it.isNotBlank() } ?: obj.optString("imageurl", null).takeIf { it != "null" && it.isNotBlank() }) ?: "",
                    link = obj.optString("link", null).takeIf { it != "null" && it.isNotBlank() }
                ))
            }
            list
        } catch (e: Exception) {
            Log.w("SupabaseFetch", "Banners fetch notice: ${e.message}")
            emptyList()
        }
    }

    suspend fun fetchBroadcasts(): List<BroadcastNotification> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/broadcasts?order=created_at.desc&limit=20")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            response.close()

            val jsonArray = org.json.JSONArray(body)
            val list = mutableListOf<BroadcastNotification>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(BroadcastNotification(
                    id = obj.optString("id"),
                    title = obj.getString("title"),
                    message = obj.getString("message"),
                    priority = obj.optString("priority", "Normal"),
                    link = obj.optString("link", null).takeIf { it != "null" && it.isNotBlank() },
                    playSound = obj.optBoolean("play_sound", false),
                    isActive = obj.optBoolean("is_active", true),
                    createdAt = obj.optString("created_at", "")
                ))
            }
            list
        } catch (e: Exception) {
            Log.w("SupabaseFetch", "Broadcasts fetch notice: ${e.message}")
            emptyList()
        }
    }

    suspend fun fetchSiteSettings(): JSONObject? = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/site_settings")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .get()
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            response.close()

            val jsonArray = org.json.JSONArray(body)
            val settings = JSONObject()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                settings.put(obj.getString("setting_key"), obj.get("setting_value"))
            }
            settings
        } catch (e: Exception) {
            Log.w("SupabaseFetch", "SiteSettings fetch notice: ${e.message}")
            null
        }
    }

    suspend fun saveDestination(dest: Destination) = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject()
            dest.id?.let { json.put("id", it) }
            json.put("country_name", dest.countryName)
            json.put("slug", dest.slug)
            json.put("capital", dest.capital)
            json.put("currency", dest.currency)
            json.put("avg_living_cost", dest.avgLivingCost)
            json.put("work_rights", dest.workRights)
            json.put("visa_subclass", dest.visaSubclass)
            json.put("overview", dest.overview)
            json.put("visa_process", dest.visaProcess)
            json.put("admission_requirements", dest.admissionRequirements)
            json.put("top_universities", dest.topUniversities.joinToString("\n"))
            json.put("flag", dest.flagEmoji)
            json.put("imageUrl", dest.imageUrl)

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/destinations")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "resolution=merge-duplicates")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error saving destination: ${e.message}")
        }
    }

    suspend fun deleteDestination(id: String) = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/destinations?id=eq.$id")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .delete()
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error deleting destination: ${e.message}")
        }
    }

    suspend fun saveTestimonial(t: Testimonial) = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject()
            json.put("id", t.id)
            json.put("student_name", t.studentName)
            json.put("university", t.university)
            json.put("country", t.country)
            json.put("quote", t.quote)
            json.put("rating", t.rating)
            json.put("imageUrl", t.imageUrl)

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/testimonials")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "resolution=merge-duplicates")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error saving testimonial: ${e.message}")
        }
    }

    suspend fun deleteTestimonial(id: String) = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/testimonials?id=eq.$id")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .delete()
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error deleting testimonial: ${e.message}")
        }
    }

    suspend fun saveBanner(b: Banner) = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject()
            json.put("id", b.id)
            json.put("title", b.title)
            json.put("description", b.description)
            json.put("imageUrl", b.imageUrl)
            json.put("link", b.link)

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/banners")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "resolution=merge-duplicates")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error saving banner: ${e.message}")
        }
    }

    suspend fun deleteBanner(id: String) = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/banners?id=eq.$id")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .delete()
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error deleting banner: ${e.message}")
        }
    }

    suspend fun saveBroadcast(b: BroadcastNotification) = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject()
            json.put("id", b.id)
            json.put("title", b.title)
            json.put("message", b.message)
            json.put("priority", b.priority)
            json.put("link", b.link)
            json.put("play_sound", b.playSound)
            json.put("is_active", b.isActive)

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/broadcasts")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "resolution=merge-duplicates")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error saving broadcast: ${e.message}")
        }
    }

    suspend fun deleteBroadcast(id: String) = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/broadcasts?id=eq.$id")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .delete()
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error deleting broadcast: ${e.message}")
        }
    }

    suspend fun syncAppointmentToSupabase(appointment: Appointment) = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject()
            json.put("id", appointment.id)
            json.put("client_name", appointment.clientName)
            json.put("email", appointment.email)
            json.put("phone", appointment.phone)
            json.put("destination", appointment.destination)
            json.put("appointment_date", appointment.date)
            json.put("time_slot", appointment.timeSlot)
            json.put("mode", appointment.mode.label)
            json.put("status", appointment.status.label)
            json.put("message", appointment.message)

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/appointments")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "resolution=merge-duplicates")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error syncing appointment: ${e.message}")
        }
    }

    suspend fun syncLeadToSupabase(lead: Lead) = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject()
            json.put("id", lead.id)
            json.put("full_name", lead.fullName)
            json.put("email", lead.email)
            json.put("phone", lead.phone)
            json.put("destination", lead.destination)
            json.put("course_interest", lead.courseInterest)
            json.put("status", lead.status.label)
            json.put("notes", lead.notes)

            val body = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$supabaseUrl/rest/v1/leads")
                .addHeader("apikey", supabaseKey)
                .addHeader("Authorization", "Bearer $supabaseKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "resolution=merge-duplicates")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            response.close()
        } catch (e: Exception) {
            Log.e("SupabaseSync", "Error syncing lead: ${e.message}")
        }
    }
}
