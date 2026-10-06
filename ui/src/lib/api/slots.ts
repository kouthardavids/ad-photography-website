type SlotsResponse = {
    success: boolean;
    data: string[];
};

const API_URL = import.meta.env.VITE_API_URL;

export const getBookedSlots = async (date: string) => {
    const response = await fetch(`${API_URL}/api/slots?date=${date}`);

    const result: SlotsResponse = await response.json();

    if (!response.ok) {
        throw new Error("Failed to fetch booked slots");
    }

    return result.data;
};