export type LoginResponse = {
    success: boolean;
    data: {
        id: string;
        email: string;
        role: string;
    };
};

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (
    email: string,
    password: string
) => {
    const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Invalid email or password."
        );
    }

    return result as LoginResponse;
};

export const getCurrentUser = async () => {
    const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Not authenticated."
        );
    }

    return result;
};

export const logout = async () => {
    const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to log out.");
    }
};