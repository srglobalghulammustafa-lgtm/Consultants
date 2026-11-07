package com.example

import com.example.data.ConsultancyRepository
import com.example.model.AppointmentMode
import com.example.model.LeadStatus
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class ConsultancyRepositoryTest {

    private lateinit var repository: ConsultancyRepository

    @Before
    fun setUp() {
        repository = ConsultancyRepository()
    }

    @Test
    fun doubleBookingPrevention_failsDuplicateSlot() {
        val testDate = "2026-12-01"
        val testSlot = "10:00 AM - 11:00 AM"

        // First booking must succeed
        val firstResult = repository.bookAppointment(
            clientName = "Farhan Ali",
            email = "farhan@example.com",
            phone = "+92 300 1112233",
            destination = "Australia",
            date = testDate,
            timeSlot = testSlot,
            mode = AppointmentMode.OFFICE,
            message = "First inquiry"
        )
        assertTrue("First booking should succeed", firstResult.isSuccess)

        // Slot must now be marked occupied
        assertTrue("Slot must be detected as occupied", repository.isSlotOccupied(testDate, testSlot))

        // Second booking attempt on same date and slot must fail!
        val secondResult = repository.bookAppointment(
            clientName = "Kamran Khan",
            email = "kamran@example.com",
            phone = "+92 300 4445566",
            destination = "United Kingdom",
            date = testDate,
            timeSlot = testSlot,
            mode = AppointmentMode.ONLINE,
            message = "Second conflicting inquiry"
        )
        assertTrue("Duplicate slot booking must fail", secondResult.isFailure)
        assertTrue(
            "Error message should mention already booked",
            secondResult.exceptionOrNull()?.message?.contains("already been booked") == true
        )

        // Booking on a different slot for the same date must succeed
        val differentSlotResult = repository.bookAppointment(
            clientName = "Kamran Khan",
            email = "kamran@example.com",
            phone = "+92 300 4445566",
            destination = "United Kingdom",
            date = testDate,
            timeSlot = "02:00 PM - 03:00 PM",
            mode = AppointmentMode.ONLINE,
            message = "Different slot inquiry"
        )
        assertTrue("Different slot booking should succeed", differentSlotResult.isSuccess)
    }

    @Test
    fun leadSubmissionAndStatusUpdate() {
        val lead = repository.submitLead(
            name = "Amina Sheikh",
            email = "amina@example.com",
            phone = "+92 321 0001122",
            destination = "Canada",
            courseInterest = "Computer Science",
            notes = "Initial lead"
        )

        assertEquals("Amina Sheikh", lead.fullName)
        assertEquals(LeadStatus.NEW, lead.status)

        // Advance stage
        repository.updateLeadStatus(lead.id, LeadStatus.CONTACTED, "Phone consultation completed")
        val updatedLead = repository.leads.value.find { it.id == lead.id }
        assertNotNull(updatedLead)
        assertEquals(LeadStatus.CONTACTED, updatedLead?.status)
        assertTrue(updatedLead?.notes?.contains("Phone consultation completed") == true)
    }

    @Test
    fun adminPinVerification() {
        assertTrue(repository.verifyAdminPin("1234"))
        assertTrue(repository.verifyAdminPin("0000"))
        assertFalse(repository.verifyAdminPin("9999"))
        assertFalse(repository.verifyAdminPin(""))
    }
}
