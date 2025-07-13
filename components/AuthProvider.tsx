'use client'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState, PropsWithChildren } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    logout: () => void
    accessToken: string | null
    setAccessToken: Dispatch<SetStateAction<string | null>>
    refreshAccessToken: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)


export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const router = useRouter()
    console.log("accessToken", accessToken)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) {
                setAccessToken(token);
            }
        }
    }, []);

    const logout = () => {
        localStorage.clear();
        setAccessToken(null);
        router.replace("/login")
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const res = await axios.post("/api/auth/refresh", { refreshToken }); // Adjust URL if needed
            const newToken = res.data.accessToken;

            localStorage.setItem("accessToken", newToken);
            setAccessToken(newToken);

            return newToken;
        } catch (err) {
            logout();
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, refreshAccessToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
