// components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider"; // adjust path as needed

type Props = {
    children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const { accessToken } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            if (!accessToken || accessToken === "null") {
                router.replace("/login");
            } else {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [accessToken, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
