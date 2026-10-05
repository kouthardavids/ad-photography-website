import { supabase } from "../supabase.js";
import { Booking } from "./types/booking.js";

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