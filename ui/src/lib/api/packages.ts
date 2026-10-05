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

export const getPackages = async () => {
    const response = await fetch("http://localhost:8000/api/packages");

    const result: PackagesResponse = await response.json();

    if (!response.ok) {
        throw new Error("Failed to fetch packages");
    }

    return result.data;
};