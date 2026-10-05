type SlotsResponse = {
    success: boolean;
    data: string[];
};

export const getBookedSlots = async (date: string) => {
    const response = await fetch(`http://localhost:8000/api/slots?date=${date}`);

    const result: SlotsResponse = await response.json();

    if (!response.ok) {
        throw new Error("Failed to fetch booked slots");
    }

    return result.data;
};