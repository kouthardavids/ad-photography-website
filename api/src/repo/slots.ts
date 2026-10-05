import { supabase } from "../supabase.js";

export const getBookedSlots = async (date: string) => {
    const { data, error } = await supabase
        .from("booking_slots")
        .select("time, bookings!inner(status)")
        .eq("date", date)
        .in("bookings.status", ["pending", "confirmed"]);

    if (error) {
        throw error;
    }

    return data.map((slot) => slot.time.slice(0, 5));
}; 