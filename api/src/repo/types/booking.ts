export type Booking = {
    package_id: number;
    date: string;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    times: string[];
};