export type Package = {
    id: number;
    name: string;
    description: string;
    price: number;
};

type PackagesResponse = {
    success: boolean;
    data: Package[];
};

const API_URL = import.meta.env.VITE_API_URL;

export const getPackages = async () => {
    const response = await fetch(`${API_URL}/api/packages`);

    const result: PackagesResponse = await response.json();

    if (!response.ok) {
        throw new Error("Failed to fetch packages");
    }

    return result.data;
};