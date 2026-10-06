import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/api/auth";

type Props = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await getCurrentUser();
                setAuthenticated(true);
            } catch (error) {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-neutral-500">
                    Loading...
                </p>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}