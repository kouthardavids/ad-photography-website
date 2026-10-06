export type CreateBooking = {
    package_id: number;
    date: string;
    name: string;
    email: string;
    phone: string;
    notes: string;
    times: string[];
};

export type BookingResponse = {
    success: boolean;
    data: {
        id: number;
        ref: string;
        package_id: number;
        date: string;
        name: string;
        email: string;
        phone: string;
        notes: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
};

export interface DashboardBooking {
    id: number;
    ref: string;
    package_id: number;
    package: {
        name: string;
        price: number;
    };
    date: string;
    name: string;
    email: string;
    phone: string;
    notes: string | null;
    status: string;
    created_at: string;
    updated_at?: string;
    times: string[];
}

const API_URL = import.meta.env.VITE_API_URL;

export const createBooking = async (booking: CreateBooking) => {
    const response = await fetch(`${API_URL}/api/booking`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to create booking");
    }

    return result as BookingResponse;
};

export const getPendingBookings = async () => {
    const response = await fetch(
        `${API_URL}/api/pending/bookings`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch pending bookings");
    }

    return result as DashboardBooking[];
};

export const confirmBooking = async (ref: string) => {
    const response = await fetch(
        `${API_URL}/api/booking/${ref}/confirm`,
        {
            method: "PATCH",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to confirm booking");
    }

    return result;
};

export const cancelBooking = async (
    ref: string,
    reason: string
) => {
    const response = await fetch(
        `${API_URL}/api/booking/${ref}/cancel`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to cancel booking"
        );
    }

    return result;
};

export const getConfirmedBookings = async (): Promise<DashboardBooking[]> => {
    const response = await fetch(
        `${API_URL}/api/confirmed/bookings`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch confirmed bookings");
    }

    return response.json();
};

export const rescheduleBooking = async (
    ref: string,
    date: string,
    times: string[]
) => {
    const response = await fetch(
        `${API_URL}/api/booking/${ref}/reschedule`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                date,
                times,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to reschedule booking"
        );
    }

    return result as {
        success: boolean;
        data: DashboardBooking;
    };
};

export const getCanceledBookings = async (): Promise<DashboardBooking[]> => {
    const response = await fetch(
        `${API_URL}/api/canceled/bookings`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch canceled bookings");
    }

    return response.json();
};