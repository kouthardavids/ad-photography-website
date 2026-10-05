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

export const createBooking = async (booking: CreateBooking) => {
    const response = await fetch("http://localhost:8000/api/booking", {
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