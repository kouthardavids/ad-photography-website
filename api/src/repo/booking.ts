import { supabase } from "../supabase.js";
import { Booking } from "./types/booking.js";
import { supabaseAdmin } from "../supabaseAdmin.js";

// insert client info in booking table, then its time slots
export const booking = async (input: Booking) => {
    const { times, ...bookingData } = input;

    const { data, error } = await supabase
        .from("bookings")
        .insert({
            ...bookingData,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    const { error: slotsError } = await supabase
        .from("booking_slots")
        .insert(
            times.map((time) => ({
                booking_id: data.id,
                date: data.date,
                time,
            }))
        );

    if (slotsError) {
        // remove the booking so a taken slot doesn't leave an empty booking
        await supabase.from("bookings").delete().eq("id", data.id);
        throw slotsError;
    }

    return data;
};

export const countPendingByEmail = async (email: String) => {
    const { count, error } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .eq("status", "pending");

    if (error) {
        throw error;
    }

    return count ?? 0;
}


// dashboard get bookings pending 
export const getPendingBookings = async () => {
    const { data, error } = await supabaseAdmin
        .from("bookings")
        .select(`
            ref,
            package_id,
            package:packages (
                name,
                price
            ),
            date,
            name,
            email,
            phone,
            notes,
            status,
            created_at,
            booking_slots (
                time
            )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data.map((booking) => ({
        ...booking,
        times: booking.booking_slots.map((slot) =>
            slot.time.slice(0, 5)
        ),
    }));
};

export const getCanceledBookings = async () => {
    const { data, error } = await supabaseAdmin
        .from("bookings")
        .select(`
            ref,
            package_id,
            package:packages (
                name,
                price
            ),
            date,
            name,
            email,
            phone,
            notes,
            status,
            created_at,
            booking_slots (
                time
            )
        `)
        .eq("status", "canceled")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data.map((booking) => ({
        ...booking,
        times: booking.booking_slots.map((slot) =>
            slot.time.slice(0, 5)
        ),
    }));
};

// update status -> confirmed when confirmed an existing pending booking request and then send email, 
export const confirmBooking = async (ref: string) => {
    const { data, error } = await supabaseAdmin
        .from("bookings")
        .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
        })
        .eq("ref", ref)
        .eq("status", "pending")
        .select(`
            id,
            ref,
            package_id,
            package:packages (
                name,
                price
            ),
            date,
            name,
            email,
            phone,
            notes,
            status,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getBookingTimes = async (bookingId: number) => {
    const { data, error } = await supabase
        .from("booking_slots")
        .select("time")
        .eq("booking_id", bookingId)
        .order("time", { ascending: true });

    if (error) {
        throw error;
    }

    return data.map((slot) => slot.time.slice(0, 5));
};

export const cancelBooking = async (
    ref: string,
    reason: string
) => {
    const { data, error } = await supabaseAdmin
        .from("bookings")
        .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
        })
        .eq("ref", ref)
        .in("status", ["pending", "confirmed"])
        .select(`
            id,
            ref,
            package_id,
            date,
            name,
            email,
            phone,
            notes,
            status,
            created_at,
            updated_at
        `)
        .single();

    if (error) {
        throw error;
    }

    // Free the time slots so someone else can book them.
    // The booking is already canceled, so log a failure here instead of failing the request.
    const { error: slotsError } = await supabaseAdmin
        .from("booking_slots")
        .delete()
        .eq("booking_id", data.id);

    if (slotsError) {
        console.error("Failed to free slots for canceled booking:", slotsError);
    }

    return data;
};

export const getConfirmedBookings = async () => {
    const { data, error } = await supabaseAdmin
        .from("bookings")
        .select(`
            id,
            ref,
            package_id,
            package:packages (
                name,
                price
            ),
            date,
            name,
            email,
            phone,
            notes,
            status,
            created_at,
            updated_at,
            booking_slots (
                time
            )
        `)
        .eq("status", "confirmed")
        .order("updated_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data.map((booking) => ({
        ...booking,
        times: booking.booking_slots.map((slot) =>
            slot.time.slice(0, 5)
        ),
    }));
};

export const rescheduleBooking = async (
    ref: string,
    date: string,
    times: string[]
) => {
    const { data: booking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .select("id, ref, status")
        .eq("ref", ref)
        .single();

    if (bookingError) {
        throw bookingError;
    }

    if (booking.status !== "confirmed") {
        throw new Error(
            "Only confirmed bookings can be rescheduled."
        );
    }

    /*
     * Check that the requested slots are not already
     * being used by another booking.
     */
    const { data: existingSlots, error: slotsError } =
        await supabase
            .from("booking_slots")
            .select("id, booking_id, time")
            .eq("date", date)
            .in("time", times);

    if (slotsError) {
        throw slotsError;
    }

    const conflictingSlots = existingSlots.filter(
        (slot) => slot.booking_id !== booking.id
    );

    if (conflictingSlots.length > 0) {
        const error = new Error(
            "One or more selected time slots are already booked."
        );

        error.name = "SlotConflict";

        throw error;
    }


    //Remove the old slots.
    const { error: deleteError } = await supabase
        .from("booking_slots")
        .delete()
        .eq("booking_id", booking.id);

    if (deleteError) {
        throw deleteError;
    }

    //Add the new slots.
    const { error: insertError } = await supabase
        .from("booking_slots")
        .insert(
            times.map((time) => ({
                booking_id: booking.id,
                date,
                time,
            }))
        );

    if (insertError) {
        throw insertError;
    }


    //Update the booking date.
    const { data, error } = await supabase
        .from("bookings")
        .update({
            date,
            updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id)
        .select(`
            id,
            ref,
            package_id,
            package:packages (
                name,
                price
            ),
            date,
            name,
            email,
            phone,
            notes,
            status,
            created_at,
            updated_at,
            booking_slots (
                time
            )
        `)
        .single();

    if (error) {
        throw error;
    }

    return {
        ...data,
        times: data.booking_slots.map(
            (slot) => slot.time.slice(0, 5)
        ),
    };
};